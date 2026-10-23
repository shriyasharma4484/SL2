import { pool } from '../config/db.js';

// 1. Get High-Level Dashboard KPI Metrics
export async function getIntelligenceMetrics(req, res) {
  try {
    // Total recurring locations
    const [locRows] = await pool.query('SELECT COUNT(*) AS total FROM civic_locations');
    const recurringLocations = locRows[0]?.total || 0;

    // Follow-ups due (Scheduled or Overdue inspections)
    const [inspRows] = await pool.query(`
      SELECT COUNT(*) AS due 
      FROM location_inspections 
      WHERE status IN ('Scheduled', 'Overdue')
    `);
    const followUpsDue = inspRows[0]?.due || 0;

    // Interventions verified (Completed interventions)
    const [intRows] = await pool.query(`
      SELECT COUNT(*) AS verified 
      FROM location_interventions 
      WHERE status = 'Completed'
    `);
    const interventionsVerified = intRows[0]?.verified || 0;

    // Locations remaining recurrence-free (Sustained Resolution)
    const [sustRows] = await pool.query(`
      SELECT COUNT(*) AS sustained 
      FROM civic_locations 
      WHERE status = 'Sustained Resolution'
    `);
    const recurrenceFree = sustRows[0]?.sustained || 0;

    // Additional breakdown
    const [activeRows] = await pool.query(`
      SELECT COUNT(*) AS active 
      FROM civic_locations 
      WHERE status = 'Active Recurrence'
    `);
    const activeRecurrence = activeRows[0]?.active || 0;

    res.json({
      success: true,
      metrics: {
        recurringLocations,
        followUpsDue,
        interventionsVerified,
        recurrenceFree,
        activeRecurrence
      }
    });
  } catch (error) {
    console.error('[Intelligence Controller] Error getting metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to load intelligence metrics' });
  }
}

// 2. Get All Recurring Civic Locations with Triage Info
export async function getCivicLocations(req, res) {
  try {
    const { status, priority, category, search } = req.query;

    let query = `
      SELECT 
        l.*,
        (SELECT COUNT(*) FROM location_interventions i WHERE i.location_id = l.id) AS total_interventions,
        (SELECT COUNT(*) FROM location_interventions i WHERE i.location_id = l.id AND i.status = 'Completed') AS completed_interventions,
        (SELECT MIN(ins.scheduled_date) FROM location_inspections ins WHERE ins.location_id = l.id AND ins.status IN ('Scheduled', 'Overdue')) AS next_followup_date,
        (SELECT ins.status FROM location_inspections ins WHERE ins.location_id = l.id AND ins.status IN ('Scheduled', 'Overdue') ORDER BY ins.scheduled_date ASC LIMIT 1) AS followup_urgency
      FROM civic_locations l
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND l.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'all') {
      query += ` AND l.priority = ?`;
      params.push(priority);
    }

    if (category && category !== 'all') {
      query += ` AND l.category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (l.name LIKE ? OR l.area LIKE ? OR l.suspected_root_cause LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY 
      CASE l.priority 
        WHEN 'Critical' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        WHEN 'Low' THEN 4 
        ELSE 5 
      END ASC, 
      l.incident_count DESC`;

    const [locations] = await pool.query(query, params);

    res.json({
      success: true,
      locations
    });
  } catch (error) {
    console.error('[Intelligence Controller] Error fetching locations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recurring locations' });
  }
}

// 3. Get Single Location Details with Full Evidence Timeline, Diagnostic & Interventions
export async function getCivicLocationById(req, res) {
  try {
    const { id } = req.params;

    // Get location
    const [locRows] = await pool.query('SELECT * FROM civic_locations WHERE id = ?', [id]);
    if (locRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Civic location not found' });
    }
    const location = locRows[0];

    // Get linked reports and evidence photos
    const [reports] = await pool.query(`
      SELECT 
        r.id,
        r.reference_no,
        r.title,
        r.description,
        r.category,
        r.severity,
        r.status,
        r.location_address,
        r.created_at,
        r.resolution_photo,
        r.reporter_rating,
        lr.distance_meters,
        u.name AS reporter_name,
        (SELECT photo_url FROM report_photographs rp WHERE rp.report_id = r.id AND rp.is_primary = 1 LIMIT 1) AS primary_photo
      FROM location_reports lr
      JOIN reports r ON lr.report_id = r.id
      LEFT JOIN users u ON r.reporter_id = u.id
      WHERE lr.location_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    // Get interventions
    const [interventions] = await pool.query(`
      SELECT 
        i.*,
        u.name AS coordinator_name
      FROM location_interventions i
      LEFT JOIN users u ON i.assigned_coordinator_id = u.id
      WHERE i.location_id = ?
      ORDER BY i.created_at DESC
    `, [id]);

    // Get inspections / follow-ups
    const [inspections] = await pool.query(`
      SELECT 
        ins.*,
        u.name AS inspector_name
      FROM location_inspections ins
      LEFT JOIN users u ON ins.inspector_id = u.id
      WHERE ins.location_id = ?
      ORDER BY ins.scheduled_date DESC
    `, [id]);

    res.json({
      success: true,
      location,
      reports,
      interventions,
      inspections
    });
  } catch (error) {
    console.error('[Intelligence Controller] Error getting location details:', error);
    res.status(500).json({ success: false, message: 'Failed to load location intelligence details' });
  }
}

// 4. Create a Recommended Intervention
export async function createIntervention(req, res) {
  try {
    const {
      location_id,
      title,
      intervention_type,
      responsible_party,
      action_plan,
      municipal_docket_no,
      scheduled_followup_days
    } = req.body;

    const coordinator_id = req.user?.id || null;

    if (!location_id || !title || !responsible_party || !action_plan) {
      return res.status(400).json({ success: false, message: 'Missing required intervention fields' });
    }

    const [result] = await pool.query(`
      INSERT INTO location_interventions (
        location_id, title, intervention_type, responsible_party, action_plan, 
        status, assigned_coordinator_id, municipal_docket_no, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'Approved', ?, ?, NOW(), NOW())
    `, [
      location_id,
      title,
      intervention_type || 'NGO Cleanup & Community Drive',
      responsible_party,
      action_plan,
      coordinator_id,
      municipal_docket_no || null
    ]);

    // Update location status
    await pool.query(`
      UPDATE civic_locations 
      SET status = 'Intervention Planned', updated_at = NOW() 
      WHERE id = ?
    `, [location_id]);

    // Optionally schedule automated follow-up inspection
    const days = parseInt(scheduled_followup_days, 10) || 14;
    await pool.query(`
      INSERT INTO location_inspections (
        location_id, intervention_id, scheduled_date, status, outcome, notes, created_at
      ) VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), 'Scheduled', 'Pending Inspection', ?, NOW())
    `, [
      location_id,
      result.insertId,
      days,
      `Automatic follow-up scheduled ${days} days after intervention approval to verify whether problem recurred.`
    ]);

    res.json({
      success: true,
      message: 'Intervention plan registered and follow-up inspection scheduled',
      intervention_id: result.insertId
    });
  } catch (error) {
    console.error('[Intelligence Controller] Error creating intervention:', error);
    res.status(500).json({ success: false, message: 'Failed to register intervention' });
  }
}

// 5. Complete / Evaluate Intervention
export async function completeIntervention(req, res) {
  try {
    const { id } = req.params;
    const { completion_notes, completion_evidence_url, location_id } = req.body;

    await pool.query(`
      UPDATE location_interventions
      SET 
        status = 'Completed',
        completion_date = CURDATE(),
        completion_notes = ?,
        completion_evidence_url = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      completion_notes || 'Intervention executed on the ground.',
      completion_evidence_url || null,
      id
    ]);

    if (location_id) {
      await pool.query(`
        UPDATE civic_locations 
        SET status = 'Follow-up Monitoring', updated_at = NOW() 
        WHERE id = ?
      `, [location_id]);
    }

    res.json({
      success: true,
      message: 'Intervention marked as completed. Monitoring active.'
    });
  } catch (error) {
    console.error('[Intelligence Controller] Error completing intervention:', error);
    res.status(500).json({ success: false, message: 'Failed to complete intervention' });
  }
}

// 6. Record Follow-up Inspection Result (Ground Truth Outcome)
export async function recordInspection(req, res) {
  try {
    const {
      inspection_id,
      location_id,
      outcome,
      notes,
      evidence_photo_url,
      next_check_days
    } = req.body;

    const inspector_id = req.user?.id || null;

    if (!location_id || !outcome) {
      return res.status(400).json({ success: false, message: 'Missing location ID or inspection outcome' });
    }

    // Update inspection record if existing, or insert new
    if (inspection_id) {
      await pool.query(`
        UPDATE location_inspections
        SET 
          status = 'Completed',
          inspected_at = NOW(),
          inspector_id = ?,
          outcome = ?,
          notes = ?,
          evidence_photo_url = ?
        WHERE id = ?
      `, [inspector_id, outcome, notes || '', evidence_photo_url || null, inspection_id]);
    } else {
      await pool.query(`
        INSERT INTO location_inspections (
          location_id, scheduled_date, inspected_at, inspector_id, status, outcome, notes, evidence_photo_url, created_at
        ) VALUES (?, CURDATE(), NOW(), ?, 'Completed', ?, ?, ?, NOW())
      `, [location_id, inspector_id, outcome, notes || '', evidence_photo_url || null]);
    }

    // Update Civic Location status based on outcome
    if (outcome === 'Clean - Sustained Resolution') {
      await pool.query(`
        UPDATE civic_locations
        SET 
          status = 'Sustained Resolution',
          recurrence_free_since = COALESCE(recurrence_free_since, NOW()),
          days_recurrence_free = days_recurrence_free + 14,
          updated_at = NOW()
        WHERE id = ?
      `, [location_id]);
    } else if (outcome === 'Severe Recurrence - Intervene Again' || outcome === 'Partial Recurrence') {
      await pool.query(`
        UPDATE civic_locations
        SET 
          status = 'Active Recurrence',
          incident_count = incident_count + 1,
          recurrence_free_since = NULL,
          days_recurrence_free = 0,
          priority = 'Critical',
          updated_at = NOW()
        WHERE id = ?
      `, [location_id]);

      // If next follow-up requested
      if (next_check_days) {
        await pool.query(`
          INSERT INTO location_inspections (
            location_id, scheduled_date, status, outcome, notes, created_at
          ) VALUES (?, DATE_ADD(CURDATE(), INTERVAL ? DAY), 'Scheduled', 'Pending Inspection', ?, NOW())
        `, [location_id, parseInt(next_check_days, 10), 'Re-inspection scheduled after recurrence observed.']);
      }
    }

    res.json({
      success: true,
      message: `Inspection outcome '${outcome}' verified and saved to location audit history.`
    });
  } catch (error) {
    console.error('[Intelligence Controller] Error recording inspection:', error);
    res.status(500).json({ success: false, message: 'Failed to record inspection' });
  }
}
