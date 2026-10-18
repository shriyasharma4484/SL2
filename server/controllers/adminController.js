import { pool } from '../config/db.js';

export async function getAdminOverview(req, res) {
  try {
    // 1. Report counts
    const [reportCounts] = await pool.query(`
      SELECT 
        COUNT(*) AS total_reports,
        SUM(CASE WHEN status IN ('Submitted', 'Under Review') THEN 1 ELSE 0 END) AS pending_review,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN severity = 'Critical' AND status NOT IN ('Resolved', 'Rejected') THEN 1 ELSE 0 END) AS critical_unresolved
      FROM reports
    `);

    // 2. User counts
    const [userCounts] = await pool.query(`
      SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'volunteer' THEN 1 ELSE 0 END) AS total_volunteers,
        SUM(CASE WHEN role = 'community_member' THEN 1 ELSE 0 END) AS total_citizens,
        SUM(CASE WHEN role = 'coordinator' THEN 1 ELSE 0 END) AS total_coordinators
      FROM users
    `);

    // 3. Event metrics
    const [eventCounts] = await pool.query(`
      SELECT 
        COUNT(*) AS total_events,
        SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) AS upcoming_events,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_events,
        COALESCE(SUM(waste_collected_kg), 0) AS total_waste_collected_kg,
        COALESCE(SUM(trees_planted), 0) AS total_trees_planted
      FROM events
    `);

    // 4. Confirmations count
    const [confirmRows] = await pool.query('SELECT COUNT(*) AS total_confirmations FROM community_confirmations');

    // 5. Recent incoming reports needing attention (top 5)
    const [incomingReports] = await pool.query(`
      SELECT r.id, r.reference_no, r.title, r.category, r.severity, r.status, r.location_address, r.created_at, u.name AS reporter_name
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      WHERE r.status IN ('Submitted', 'Under Review', 'Needs More Information')
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    // 6. Recent audit trail
    const [recentAudits] = await pool.query(`
      SELECT a.*, u.name AS user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 6
    `);

    return res.json({
      success: true,
      stats: {
        ...reportCounts[0],
        ...userCounts[0],
        ...eventCounts[0],
        total_confirmations: confirmRows[0].total_confirmations
      },
      incoming_reports: incomingReports,
      recent_audits: recentAudits
    });
  } catch (error) {
    console.error('Admin Overview Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin overview.' });
  }
}

export async function getAdminAnalytics(req, res) {
  try {
    // 1. Reports per month
    const [reportsPerMonth] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') AS month_label,
        DATE_FORMAT(created_at, '%Y-%m') AS sort_key,
        COUNT(*) AS total_submitted,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_count
      FROM reports
      GROUP BY sort_key, month_label
      ORDER BY sort_key ASC
      LIMIT 12
    `);

    // 2. Category distribution
    const [categories] = await pool.query(`
      SELECT category, COUNT(*) AS count
      FROM reports
      GROUP BY category
      ORDER BY count DESC
    `);

    // 3. Status breakdown
    const [statusDistribution] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM reports
      GROUP BY status
    `);

    // 4. Severity breakdown
    const [severityDistribution] = await pool.query(`
      SELECT severity, COUNT(*) AS count
      FROM reports
      GROUP BY severity
      ORDER BY 
        CASE severity 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
        END
    `);

    // 5. Volunteer Leaderboard
    const [volunteers] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.area, u.points, u.avatar_url,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.user_id = u.id AND er.registration_status = 'Attended') AS drives_attended,
        (SELECT COUNT(*) FROM volunteer_assignments va WHERE va.volunteer_id = u.id) AS assigned_tasks
      FROM users u
      WHERE u.role = 'volunteer'
      ORDER BY u.points DESC, drives_attended DESC
      LIMIT 10
    `);

    return res.json({
      success: true,
      analytics: {
        reports_per_month: reportsPerMonth,
        categories,
        status_distribution: statusDistribution,
        severity_distribution: severityDistribution,
        volunteers
      }
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate analytics.' });
  }
}

export async function getIncomingReports(req, res) {
  try {
    const [reports] = await pool.query(`
      SELECT 
        r.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        u.phone AS reporter_phone,
        (SELECT photo_url FROM report_photographs rp WHERE rp.report_id = r.id ORDER BY rp.is_primary DESC LIMIT 1) AS primary_photo
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      WHERE r.status IN ('Submitted', 'Under Review', 'Needs More Information')
      ORDER BY 
        CASE r.severity 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
        END,
        r.created_at ASC
    `);

    return res.json({ success: true, reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch incoming reports.' });
  }
}

export async function getVolunteerRoster(req, res) {
  try {
    const [volunteers] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.address, u.area, u.points, u.is_active, u.created_at,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.user_id = u.id AND er.registration_status = 'Attended') AS attended_drives,
        (SELECT COUNT(*) FROM volunteer_assignments va WHERE va.volunteer_id = u.id) AS total_assignments,
        (SELECT COUNT(*) FROM volunteer_assignments va WHERE va.volunteer_id = u.id AND va.progress_status = 'Verified') AS completed_assignments
      FROM users u
      WHERE u.role = 'volunteer'
      ORDER BY u.points DESC
    `);

    return res.json({ success: true, volunteers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch volunteer roster.' });
  }
}

export async function moderateComment(req, res) {
  try {
    const { id } = req.params;
    const { is_hidden, moderation_reason } = req.body;

    await pool.query(
      `UPDATE comments SET 
        is_hidden = ?,
        moderated_by_id = ?,
        moderation_reason = ?
      WHERE id = ?`,
      [is_hidden === true || is_hidden === 'true', req.user.id, moderation_reason || 'Moderated by Sevadeep coordinator', id]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_id, target_type, target_id, details)
       VALUES (?, ?, 'Comment', ?, ?)`,
      ['COMMENT_MODERATED', req.user.id, id, `Comment ${id} hidden: ${is_hidden}. Reason: ${moderation_reason}`]
    );

    return res.json({
      success: true,
      message: is_hidden ? 'Comment has been hidden from public view.' : 'Comment restored to public view.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to moderate comment.' });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const [logs] = await pool.query(`
      SELECT a.*, u.name AS user_name, u.role AS user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    return res.json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
}

export async function getAllCommentsForModeration(req, res) {
  try {
    const [comments] = await pool.query(`
      SELECT 
        cm.*,
        u.name AS user_name,
        u.email AS user_email,
        r.reference_no,
        r.title AS report_title
      FROM comments cm
      JOIN users u ON cm.user_id = u.id
      JOIN reports r ON cm.report_id = r.id
      ORDER BY cm.created_at DESC
      LIMIT 50
    `);

    return res.json({ success: true, comments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch comments for moderation.' });
  }
}
