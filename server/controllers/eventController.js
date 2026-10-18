import { pool } from '../config/db.js';

export async function getEvents(req, res) {
  try {
    const { status, category } = req.query;
    const userId = req.user ? req.user.id : null;

    let whereConditions = [];
    const params = [];

    if (status && status !== 'All') {
      whereConditions.push('e.status = ?');
      params.push(status);
    }

    if (category && category !== 'All') {
      whereConditions.push('e.category = ?');
      params.push(category);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        e.*,
        u.name AS coordinator_name,
        u.email AS coordinator_email,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.registration_status = 'Registered') AS registered_count,
        (e.total_slots - (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.registration_status = 'Registered')) AS available_slots
      FROM events e
      LEFT JOIN users u ON e.coordinator_id = u.id
      ${whereClause}
      ORDER BY 
        CASE e.status 
          WHEN 'Upcoming' THEN 1 
          WHEN 'In Progress' THEN 2 
          WHEN 'Completed' THEN 3 
          ELSE 4 
        END,
        e.event_date ASC
    `;

    const [events] = await pool.query(sql, params);

    // If user is logged in, attach is_registered boolean
    if (userId) {
      const [userRegs] = await pool.query(
        'SELECT event_id, registration_status FROM event_registrations WHERE user_id = ?',
        [userId]
      );
      const regMap = new Map();
      userRegs.forEach(r => regMap.set(r.event_id, r.registration_status));

      events.forEach(ev => {
        ev.user_registration_status = regMap.get(ev.id) || null;
        ev.is_user_registered = regMap.get(ev.id) === 'Registered';
      });
    }

    return res.json({ success: true, events });
  } catch (error) {
    console.error('Get Events Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
}

export async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const isCoordinator = req.user && req.user.role === 'coordinator';

    const [rows] = await pool.query(
      `SELECT 
        e.*,
        u.name AS coordinator_name,
        u.email AS coordinator_email,
        u.phone AS coordinator_phone,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.registration_status = 'Registered') AS registered_count,
        (e.total_slots - (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.registration_status = 'Registered')) AS available_slots
      FROM events e
      LEFT JOIN users u ON e.coordinator_id = u.id
      WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const event = rows[0];

    // Check current user's registration
    event.is_user_registered = false;
    event.user_registration_status = null;
    if (userId) {
      const [reg] = await pool.query(
        'SELECT registration_status FROM event_registrations WHERE event_id = ? AND user_id = ?',
        [id, userId]
      );
      if (reg.length > 0) {
        event.user_registration_status = reg[0].registration_status;
        event.is_user_registered = reg[0].registration_status === 'Registered';
      }
    }

    // Registrations roster (visible to coordinators)
    let participants = [];
    if (isCoordinator) {
      const [pRows] = await pool.query(
        `SELECT er.*, u.name, u.email, u.phone, u.role
         FROM event_registrations er
         JOIN users u ON er.user_id = u.id
         WHERE er.event_id = ?
         ORDER BY er.registered_at ASC`,
        [id]
      );
      participants = pRows;
    }

    return res.json({
      success: true,
      event: {
        ...event,
        participants
      }
    });
  } catch (error) {
    console.error('Get Event By ID Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch event details.' });
  }
}

export async function registerForEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    if (eventRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const event = eventRows[0];
    if (event.status !== 'Upcoming') {
      return res.status(400).json({ success: false, message: 'Registrations are only open for upcoming events.' });
    }

    // Check slots
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS count FROM event_registrations WHERE event_id = ? AND registration_status = \'Registered\'',
      [id]
    );
    if (countRows[0].count >= event.total_slots) {
      return res.status(400).json({ success: false, message: 'Sorry, this event has reached maximum capacity.' });
    }

    // Check existing registration
    const [existing] = await pool.query(
      'SELECT id, registration_status FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length > 0) {
      if (existing[0].registration_status === 'Registered') {
        return res.status(400).json({ success: false, message: 'You are already registered for this activity.' });
      } else {
        // Re-activate cancelled registration
        await pool.query(
          'UPDATE event_registrations SET registration_status = \'Registered\', registered_at = CURRENT_TIMESTAMP WHERE id = ?',
          [existing[0].id]
        );
      }
    } else {
      await pool.query(
        'INSERT INTO event_registrations (event_id, user_id, registration_status) VALUES (?, ?, \'Registered\')',
        [id, userId]
      );
    }

    // Award 5 points for civic commitment
    await pool.query('UPDATE users SET points = points + 5 WHERE id = ?', [userId]);

    // Send in-app notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'event_reminder', ?)`,
      [
        userId,
        'Event Registration Confirmed!',
        `You have successfully registered for "${event.title}". Meet our team at ${event.location_name} on ${event.event_date} at ${event.start_time}.`,
        `/activities/${id}`
      ]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_id, target_type, target_id, details)
       VALUES (?, ?, 'Event', ?, ?)`,
      ['EVENT_REGISTERED', userId, id, `User ${req.user.name} registered for ${event.title}`]
    );

    return res.json({
      success: true,
      message: `You are confirmed for "${event.title}"! We look forward to seeing you there.`
    });
  } catch (error) {
    console.error('Register Event Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete registration.' });
  }
}

export async function cancelRegistration(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'UPDATE event_registrations SET registration_status = \'Cancelled\' WHERE event_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json({
      success: true,
      message: 'Your registration has been cancelled.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel registration.' });
  }
}

export async function createEvent(req, res) {
  try {
    const {
      title,
      category,
      description,
      event_date,
      start_time,
      end_time,
      location_name,
      latitude,
      longitude,
      total_slots = 30
    } = req.body;

    if (!title || !category || !description || !event_date || !start_time || !location_name) {
      return res.status(400).json({ success: false, message: 'Please provide all required event details.' });
    }

    let coverImage = '/assets/drive_cleanliness_1.jpeg';
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    } else if (category === 'Tree Plantation') {
      coverImage = '/assets/drive_plantation_1.png';
    } else if (category === 'Lake Restoration') {
      coverImage = '/assets/drive_cleanliness_3.jpeg';
    }

    const lat = parseFloat(latitude) || 18.5204;
    const lng = parseFloat(longitude) || 73.8567;

    const [result] = await pool.query(
      `INSERT INTO events (
        title, category, description, event_date, start_time, end_time,
        location_name, latitude, longitude, total_slots, coordinator_id, cover_image, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Upcoming')`,
      [
        title.trim(), category, description.trim(), event_date, start_time, end_time || '11:30 AM',
        location_name.trim(), lat, lng, parseInt(total_slots, 10), req.user.id, coverImage
      ]
    );

    const newEventId = result.insertId;

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_id, target_type, target_id, details)
       VALUES (?, ?, 'Event', ?, ?)`,
      ['EVENT_CREATED', req.user.id, newEventId, `Coordinator ${req.user.name} created event "${title}"`]
    );

    return res.status(201).json({
      success: true,
      message: 'Community activity published successfully.',
      event_id: newEventId
    });
  } catch (error) {
    console.error('Create Event Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      event_date,
      start_time,
      end_time,
      location_name,
      total_slots,
      status,
      completion_summary,
      waste_collected_kg,
      trees_planted
    } = req.body;

    let coverImage = null;
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE events SET 
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        event_date = COALESCE(?, event_date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        location_name = COALESCE(?, location_name),
        total_slots = COALESCE(?, total_slots),
        status = COALESCE(?, status),
        cover_image = COALESCE(?, cover_image),
        completion_summary = COALESCE(?, completion_summary),
        waste_collected_kg = COALESCE(?, waste_collected_kg),
        trees_planted = COALESCE(?, trees_planted)
      WHERE id = ?`,
      [
        title, category, description, event_date, start_time, end_time,
        location_name, total_slots, status, coverImage,
        completion_summary, waste_collected_kg, trees_planted, id
      ]
    );

    return res.json({ success: true, message: 'Event updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
}

export async function recordAttendance(req, res) {
  try {
    const { id } = req.params; // event_id
    const { user_id, registration_status, hours_contributed = 3.0 } = req.body;

    await pool.query(
      `UPDATE event_registrations 
       SET registration_status = ?, hours_contributed = ?
       WHERE event_id = ? AND user_id = ?`,
      [registration_status, hours_contributed, id, user_id]
    );

    // If marked attended, award points
    if (registration_status === 'Attended') {
      await pool.query('UPDATE users SET points = points + 20 WHERE id = ?', [user_id]);
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Service Hours Verified!', 'Your participation has been verified by the coordinator. 20 volunteer points added to your profile.', 'system', '/volunteer/dashboard')`,
        [user_id]
      );
    }

    return res.json({ success: true, message: 'Volunteer attendance record updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record attendance.' });
  }
}
