import { pool } from '../config/db.js';

export async function getPublicImpactStats(req, res) {
  try {
    // 1. Database-derived impact statistics
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM reports WHERE status = 'Resolved') AS reports_resolved,
        (SELECT COUNT(*) FROM reports WHERE status = 'In Progress') AS reports_in_progress,
        (SELECT COUNT(*) FROM reports WHERE is_public = TRUE) AS public_issues_tracked,
        (SELECT COUNT(*) FROM events WHERE status = 'Completed') AS activities_completed,
        (SELECT COUNT(*) FROM events WHERE status = 'Upcoming') AS upcoming_activities,
        (SELECT COUNT(DISTINCT user_id) FROM event_registrations WHERE registration_status = 'Attended') AS active_volunteers_participated,
        (SELECT COALESCE(SUM(waste_collected_kg), 0) FROM events) AS total_waste_diverted_kg,
        (SELECT COALESCE(SUM(trees_planted), 0) FROM events) AS total_trees_planted,
        (SELECT COUNT(*) FROM community_confirmations) AS community_confirmations_recorded,
        (SELECT COUNT(*) FROM reports WHERE municipal_referral_status IS NOT NULL) AS municipal_referrals_tracked
    `);

    // 2. Completed project showcases with verified before/after evidence
    const [showcases] = await pool.query(`
      SELECT 
        r.id,
        r.reference_no,
        r.title,
        r.category,
        r.location_address,
        r.area,
        r.resolution_notes,
        r.resolution_photo,
        r.reporter_feedback,
        r.reporter_rating,
        r.created_at,
        r.updated_at,
        (SELECT photo_url FROM report_photographs rp WHERE rp.report_id = r.id AND rp.photo_type IN ('before', 'evidence') ORDER BY rp.id ASC LIMIT 1) AS before_photo,
        COALESCE(r.resolution_photo, (SELECT photo_url FROM report_photographs rp WHERE rp.report_id = r.id AND rp.photo_type IN ('after', 'resolution') ORDER BY rp.id DESC LIMIT 1)) AS after_photo
      FROM reports r
      WHERE r.status = 'Resolved'
      ORDER BY r.updated_at DESC
      LIMIT 6
    `);

    // 3. Municipal Escalation Trackers (Pune Municipal Corporation liaison)
    const [referrals] = await pool.query(`
      SELECT 
        id, reference_no, title, category, location_address, municipal_referral_status, status, updated_at
      FROM reports
      WHERE municipal_referral_status IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT 8
    `);

    return res.json({
      success: true,
      stats: stats[0],
      showcases,
      referrals
    });
  } catch (error) {
    console.error('Impact Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve impact data.' });
  }
}
