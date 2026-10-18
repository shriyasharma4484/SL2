import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sevadeep_civicconnect_jwt_secret_pune_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, phone, role, address, area } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Role safety: public registration cannot create coordinator role directly
    const assignedRole = role === 'volunteer' ? 'volunteer' : 'community_member';

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, address, area, avatar_url, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        phone || null,
        assignedRole,
        address || null,
        area || 'Pune',
        null,
        10 // bonus welcome points
      ]
    );

    const newUserId = result.insertId;

    // Send welcome notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [
        newUserId,
        'Welcome to Sevadeep CivicConnect!',
        'Thank you for joining our community engagement platform in Pune. You can now report local civic issues or join community drives.',
        'system',
        '/'
      ]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (action, user_id, target_type, target_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      ['USER_REGISTERED', newUserId, 'User', newUserId, `User ${name} registered as ${assignedRole}`]
    );

    const [userRows] = await pool.query(
      'SELECT id, name, email, role, phone, address, area, avatar_url, points, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    const token = generateToken(userRows[0]);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Sevadeep CivicConnect.',
      token,
      user: userRows[0]
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      area: user.area,
      avatar_url: user.avatar_url,
      points: user.points,
      created_at: user.created_at
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

export async function getMe(req, res) {
  try {
    const [unread] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    return res.json({
      success: true,
      user: {
        ...req.user,
        unread_notifications: unread[0].count
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
}

export async function switchDemoAccount(req, res) {
  try {
    const { role } = req.body; // 'coordinator', 'volunteer', 'community_member'
    let targetEmail;

    if (role === 'coordinator') targetEmail = 'coordinator@sevadeep.org';
    else if (role === 'volunteer') targetEmail = 'volunteer@sevadeep.org';
    else targetEmail = 'citizen@sevadeep.org';

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [targetEmail]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Demo account not found.' });
    }

    const user = rows[0];
    const token = generateToken(user);

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      area: user.area,
      avatar_url: user.avatar_url,
      points: user.points
    };

    return res.json({
      success: true,
      message: `Switched to ${user.name} (${user.role}) for demonstration.`,
      token,
      user: sanitizedUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error switching demo account.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, address, area } = req.body;
    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), area = COALESCE(?, area) WHERE id = ?',
      [name, phone, address, area, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, address, area, avatar_url, points FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}
