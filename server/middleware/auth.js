import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sevadeep_civicconnect_jwt_secret_pune_2026_secure';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, address, area, avatar_url, points, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (!rows[0].is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact Sevadeep administrator.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication session.' });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, address, area, avatar_url, points, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    req.user = rows.length > 0 && rows[0].is_active ? rows[0] : null;
  } catch (e) {
    req.user = null;
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}
