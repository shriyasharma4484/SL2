import { pool } from '../config/db.js';

// Helper to generate next reference number
async function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    'SELECT reference_no FROM reports ORDER BY id DESC LIMIT 1'
  );
  let nextSeq = 101;
  if (rows.length > 0 && rows[0].reference_no) {
    const match = rows[0].reference_no.match(/SVD-\d{4}-(\d+)/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }
  return `SVD-${year}-${String(nextSeq).padStart(4, '0')}`;
}

export async function createIssue(req, res) {
  try {
    const {
      title,
      description,
      category,
      severity = 'Medium',
      location_address,
      area = 'Pune',
      latitude,
      longitude
    } = req.body;

    if (!title || !description || !category || !location_address) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and location address are required.'
      });
    }

    const lat = parseFloat(latitude) || 18.5204;
    const lng = parseFloat(longitude) || 73.8567;
    const refNo = await generateReferenceNumber();

    // Insert Report (Pending review: is_public = false)
    const [result] = await pool.query(
      `INSERT INTO reports (
        reference_no, reporter_id, title, description, category, severity,
        status, location_address, area, latitude, longitude, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, 'Submitted', ?, ?, ?, ?, FALSE)`,
      [refNo, req.user.id, title.trim(), description.trim(), category, severity, location_address.trim(), area.trim(), lat, lng]
    );

    const reportId = result.insertId;

    // Save uploaded photograph if any
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
      await pool.query(
        `INSERT INTO report_photographs (report_id, photo_url, caption, is_primary, photo_type, uploaded_by_id)
         VALUES (?, ?, ?, TRUE, 'evidence', ?)`,
        [reportId, photoUrl, 'Initial issue evidence', req.user.id]
      );
    }

    // Record initial status history
    await pool.query(
      `INSERT INTO status_history (report_id, previous_status, new_status, changed_by_id, notes)
       VALUES (?, NULL, 'Submitted', ?, 'Report submitted by community member.')`,
      [reportId, req.user.id]
    );

    // Award reporting points to user (+10 pts)
    await pool.query('UPDATE users SET points = points + 10 WHERE id = ?', [req.user.id]);

    // Send confirmation in-app notification to reporter
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'report_status', ?)`,
      [
        req.user.id,
        `Report Received: ${refNo}`,
        `Your civic report "${title.slice(0, 40)}..." has been received. Our coordinators will review and schedule appropriate action.`,
        `/issues/${reportId}`
      ]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_id, target_type, target_id, details)
       VALUES (?, ?, 'Report', ?, ?)`,
      ['REPORT_SUBMITTED', req.user.id, reportId, `Report ${refNo} submitted by user ${req.user.name}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Your report has been submitted successfully and is pending review by Sevadeep coordinators.',
      reference_no: refNo,
      report_id: reportId
    });
  } catch (error) {
    console.error('Create Issue Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit report. Please try again.' });
  }
}

export async function getPublicIssues(req, res) {
  try {
    const {
      q,
      category,
      status,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));

    let whereConditions = ['(r.is_public = TRUE OR r.status IN (\'Approved\', \'In Progress\', \'Resolved\'))'];
    const queryParams = [];

    if (q && q.trim()) {
      whereConditions.push('(r.title LIKE ? OR r.description LIKE ? OR r.location_address LIKE ? OR r.area LIKE ? OR r.reference_no LIKE ?)');
      const searchStr = `%${q.trim()}%`;
      queryParams.push(searchStr, searchStr, searchStr, searchStr, searchStr);
    }

    if (category && category !== 'All') {
      whereConditions.push('r.category = ?');
      queryParams.push(category);
    }

    if (status && status !== 'All') {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }

    let orderByClause = 'ORDER BY r.created_at DESC';
    if (sort === 'oldest') {
      orderByClause = 'ORDER BY r.created_at ASC';
    } else if (sort === 'priority') {
      orderByClause = `ORDER BY 
        CASE r.severity 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          ELSE 5 
        END ASC, r.created_at DESC`;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total count query
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM reports r ${whereClause}`,
      queryParams
    );
    const total = countRows[0].total;

    // Main records query
    const sql = `
      SELECT 
        r.id,
        r.reference_no,
        r.title,
        r.description,
        r.category,
        r.severity,
        r.status,
        r.location_address,
        r.area,
        r.latitude,
        r.longitude,
        r.municipal_referral_status,
        r.created_at,
        r.updated_at,
        u.name AS reporter_name,
        v.name AS assigned_volunteer_name,
        (SELECT photo_url FROM report_photographs rp WHERE rp.report_id = r.id ORDER BY rp.is_primary DESC, rp.id ASC LIMIT 1) AS primary_photo,
        (SELECT COUNT(*) FROM community_confirmations cc WHERE cc.report_id = r.id) AS confirmations_count,
        (SELECT COUNT(*) FROM comments cm WHERE cm.report_id = r.id AND cm.is_hidden = FALSE) AS comments_count
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN users v ON r.assigned_volunteer_id = v.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const [issues] = await pool.query(sql, [...queryParams, limitNum, offset]);

    return res.json({
      success: true,
      issues,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get Public Issues Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch issues.' });
  }
}

export async function getIssueById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const isCoordinator = req.user && req.user.role === 'coordinator';

    const [rows] = await pool.query(
      `SELECT 
        r.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        v.name AS assigned_volunteer_name,
        c.name AS coordinator_name
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN users v ON r.assigned_volunteer_id = v.id
      LEFT JOIN users c ON r.coordinator_id = c.id
      WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const report = rows[0];

    // Privacy & permission check: non-public reports visible only to reporter or coordinator
    if (!report.is_public && !['Approved', 'In Progress', 'Resolved'].includes(report.status)) {
      if (!isCoordinator && report.reporter_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'This report is currently under initial review and is not publicly visible yet.'
        });
      }
    }

    // Mask reporter email for public privacy
    if (!isCoordinator && report.reporter_id !== userId) {
      delete report.reporter_email;
    }

    // Fetch photographs
    const [photographs] = await pool.query(
      'SELECT id, photo_url, caption, is_primary, photo_type, created_at FROM report_photographs WHERE report_id = ? ORDER BY is_primary DESC, id ASC',
      [id]
    );

    // Fetch status history
    const [statusHistory] = await pool.query(
      `SELECT sh.*, u.name AS changed_by_name, u.role AS changed_by_role
       FROM status_history sh
       LEFT JOIN users u ON sh.changed_by_id = u.id
       WHERE sh.report_id = ?
       ORDER BY sh.created_at ASC`,
      [id]
    );

    // Fetch comments (hide moderated comments unless coordinator)
    const commentFilter = isCoordinator ? '' : 'AND cm.is_hidden = FALSE';
    const [comments] = await pool.query(
      `SELECT cm.*, u.name AS user_name, u.role AS user_role, u.avatar_url AS user_avatar
       FROM comments cm
       LEFT JOIN users u ON cm.user_id = u.id
       WHERE cm.report_id = ? ${commentFilter}
       ORDER BY cm.created_at ASC`,
      [id]
    );

    // Fetch confirmations count
    const [confirmRows] = await pool.query(
      'SELECT COUNT(*) AS count FROM community_confirmations WHERE report_id = ?',
      [id]
    );
    const confirmationsCount = confirmRows[0].count;

    // Check if current user has confirmed
    let userHasConfirmed = false;
    if (userId) {
      const [userConfirm] = await pool.query(
        'SELECT id FROM community_confirmations WHERE report_id = ? AND user_id = ?',
        [id, userId]
      );
      userHasConfirmed = userConfirm.length > 0;
    }

    return res.json({
      success: true,
      report: {
        ...report,
        photographs,
        status_history: statusHistory,
        comments,
        confirmations_count: confirmationsCount,
        user_has_confirmed: userHasConfirmed
      }
    });
  } catch (error) {
    console.error('Get Issue Details Error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving issue details.' });
  }
}

export async function toggleConfirmation(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check existing
    const [existing] = await pool.query(
      'SELECT id FROM community_confirmations WHERE report_id = ? AND user_id = ?',
      [id, userId]
    );

    let confirmed = false;
    if (existing.length > 0) {
      await pool.query('DELETE FROM community_confirmations WHERE id = ?', [existing[0].id]);
      confirmed = false;
    } else {
      await pool.query(
        'INSERT INTO community_confirmations (report_id, user_id) VALUES (?, ?)',
        [id, userId]
      );
      confirmed = true;
      // Award 2 impact points for community confirmation
      await pool.query('UPDATE users SET points = points + 2 WHERE id = ?', [userId]);
    }

    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS count FROM community_confirmations WHERE report_id = ?',
      [id]
    );

    return res.json({
      success: true,
      confirmed,
      confirmations_count: countRows[0].count,
      message: confirmed ? 'You confirmed this community issue.' : 'Confirmation removed.'
    });
  } catch (error) {
    console.error('Toggle Confirmation Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update confirmation.' });
  }
}

export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;
    let photoUrl = null;

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
    }

    const [result] = await pool.query(
      'INSERT INTO comments (report_id, user_id, comment_text, photo_url) VALUES (?, ?, ?, ?)',
      [id, req.user.id, comment_text.trim(), photoUrl]
    );

    // Fetch report info to notify reporter if someone else commented
    const [rep] = await pool.query('SELECT reporter_id, title FROM reports WHERE id = ?', [id]);
    if (rep.length > 0 && rep[0].reporter_id !== req.user.id) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'comment', ?)`,
        [
          rep[0].reporter_id,
          'New Comment on Your Report',
          `${req.user.name} added a comment on your report "${rep[0].title.slice(0, 30)}..."`,
          `/issues/${id}`
        ]
      );
    }

    const [newComment] = await pool.query(
      `SELECT cm.*, u.name AS user_name, u.role AS user_role, u.avatar_url AS user_avatar
       FROM comments cm
       LEFT JOIN users u ON cm.user_id = u.id
       WHERE cm.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Comment posted.',
      comment: newComment[0]
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to post comment.' });
  }
}

export async function updateStatusByCoordinator(req, res) {
  try {
    const { id } = req.params;
    const {
      status,
      notes,
      coordinator_notes,
      municipal_referral_status,
      assigned_volunteer_id,
      resolution_notes
    } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Approved', 'In Progress', 'Resolved', 'Needs More Information', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const [existing] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const currentReport = existing[0];
    const previousStatus = currentReport.status;

    let resolutionPhoto = currentReport.resolution_photo;
    if (req.file) {
      resolutionPhoto = `/uploads/${req.file.filename}`;
    }

    // Set is_public: Approved, In Progress, and Resolved are public
    const isPublic = ['Approved', 'In Progress', 'Resolved'].includes(status);

    await pool.query(
      `UPDATE reports SET 
        status = ?,
        is_public = ?,
        coordinator_id = ?,
        coordinator_notes = COALESCE(?, coordinator_notes),
        municipal_referral_status = COALESCE(?, municipal_referral_status),
        assigned_volunteer_id = COALESCE(?, assigned_volunteer_id),
        resolution_notes = COALESCE(?, resolution_notes),
        resolution_photo = COALESCE(?, resolution_photo),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        status,
        isPublic,
        req.user.id,
        coordinator_notes || notes || null,
        municipal_referral_status || null,
        assigned_volunteer_id || null,
        resolution_notes || null,
        resolutionPhoto,
        id
      ]
    );

    // Record status history
    await pool.query(
      `INSERT INTO status_history (report_id, previous_status, new_status, changed_by_id, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [id, previousStatus, status, req.user.id, notes || coordinator_notes || `Status updated to ${status} by coordinator`]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_id, target_type, target_id, details)
       VALUES (?, ?, 'Report', ?, ?)`,
      [
        'STATUS_UPDATED',
        req.user.id,
        id,
        `Report ${currentReport.reference_no} status changed from ${previousStatus} to ${status}`
      ]
    );

    // Notify the reporter
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'report_status', ?)`,
      [
        currentReport.reporter_id,
        `Status Update: ${currentReport.reference_no}`,
        `Your report "${currentReport.title.slice(0, 30)}..." status has been updated to "${status}".`,
        `/issues/${id}`
      ]
    );

    // If assigned a volunteer, notify the volunteer
    if (assigned_volunteer_id && assigned_volunteer_id !== currentReport.assigned_volunteer_id) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'assignment', ?)`,
        [
          assigned_volunteer_id,
          `New Task Assignment: ${currentReport.reference_no}`,
          `You have been assigned to coordinate action on "${currentReport.title.slice(0, 35)}...".`,
          `/issues/${id}`
        ]
      );

      // Create volunteer assignment entry
      await pool.query(
        `INSERT INTO volunteer_assignments (report_id, volunteer_id, assigned_by_id, assignment_notes, progress_status)
         VALUES (?, ?, ?, ?, 'Assigned')`,
        [id, assigned_volunteer_id, req.user.id, notes || 'Assigned by coordinator']
      );
    }

    return res.json({
      success: true,
      message: `Report status successfully updated to ${status}.`
    });
  } catch (error) {
    console.error('Coordinator Update Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update report status.' });
  }
}

export async function submitResolutionFeedback(req, res) {
  try {
    const { id } = req.params;
    const { confirmed_resolution, rating, feedback } = req.body;

    const [rows] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const report = rows[0];
    if (report.reporter_id !== req.user.id && req.user.role !== 'coordinator') {
      return res.status(403).json({ success: false, message: 'Only the original reporter can submit resolution feedback.' });
    }

    await pool.query(
      `UPDATE reports SET 
        reporter_confirmed_resolution = ?,
        reporter_rating = ?,
        reporter_feedback = ?
      WHERE id = ?`,
      [confirmed_resolution === true || confirmed_resolution === 'true', rating || 5, feedback || null, id]
    );

    // Award bonus feedback points to citizen (+5 pts)
    await pool.query('UPDATE users SET points = points + 5 WHERE id = ?', [req.user.id]);

    return res.json({
      success: true,
      message: 'Thank you for your feedback! Your verification helps keep Pune communities accountable.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
}

export async function getMyReports(req, res) {
  try {
    const [reports] = await pool.query(
      `SELECT 
        r.*,
        (SELECT photo_url FROM report_photographs rp WHERE rp.report_id = r.id ORDER BY rp.is_primary DESC LIMIT 1) AS primary_photo,
        (SELECT COUNT(*) FROM community_confirmations cc WHERE cc.report_id = r.id) AS confirmations_count,
        (SELECT COUNT(*) FROM comments cm WHERE cm.report_id = r.id) AS comments_count
      FROM reports r
      WHERE r.reporter_id = ?
      ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch personal reports.' });
  }
}

export async function getAssignedToVolunteer(req, res) {
  try {
    const [assignments] = await pool.query(
      `SELECT 
        va.*,
        r.reference_no,
        r.title AS report_title,
        r.category AS report_category,
        r.severity AS report_severity,
        r.status AS report_status,
        r.location_address,
        r.latitude,
        r.longitude,
        (SELECT photo_url FROM report_photographs rp WHERE rp.report_id = r.id ORDER BY rp.is_primary DESC LIMIT 1) AS primary_photo
      FROM volunteer_assignments va
      JOIN reports r ON va.report_id = r.id
      WHERE va.volunteer_id = ?
      ORDER BY va.assigned_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned tasks.' });
  }
}

export async function submitVolunteerProgress(req, res) {
  try {
    const { id } = req.params; // report_id
    const { progress_status, completion_notes } = req.body;
    let photoUrl = null;

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
      // Add as progress photo
      await pool.query(
        `INSERT INTO report_photographs (report_id, photo_url, caption, is_primary, photo_type, uploaded_by_id)
         VALUES (?, ?, ?, FALSE, 'progress', ?)`,
        [id, photoUrl, completion_notes || 'Volunteer progress update', req.user.id]
      );
    }

    await pool.query(
      `UPDATE volunteer_assignments 
       SET progress_status = COALESCE(?, progress_status),
           completion_notes = COALESCE(?, completion_notes),
           completed_at = CASE WHEN ? = 'Work Submitted' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE report_id = ? AND volunteer_id = ?`,
      [progress_status, completion_notes, progress_status, id, req.user.id]
    );

    // Record status history note
    await pool.query(
      `INSERT INTO status_history (report_id, previous_status, new_status, changed_by_id, notes)
       VALUES (?, 'In Progress', 'In Progress', ?, ?)`,
      [id, req.user.id, `Volunteer progress update: ${completion_notes || progress_status}`]
    );

    return res.json({
      success: true,
      message: 'Progress update submitted successfully for coordinator review.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit volunteer progress.' });
  }
}
