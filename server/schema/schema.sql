-- Sevadeep CivicConnect Database Schema
-- Custom-built for Sevadeep NGO, Pune, Maharashtra
-- (Tables will be created in the currently connected database)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('community_member', 'volunteer', 'coordinator') NOT NULL DEFAULT 'community_member',
    address VARCHAR(255) NULL,
    area VARCHAR(100) DEFAULT 'Pune',
    avatar_url VARCHAR(255) NULL,
    points INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Community Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_no VARCHAR(50) NOT NULL UNIQUE,
    reporter_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Submitted', 'Under Review', 'Approved', 'In Progress', 'Resolved', 'Needs More Information', 'Rejected') DEFAULT 'Submitted',
    location_address VARCHAR(255) NOT NULL,
    area VARCHAR(100) DEFAULT 'Pune',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    assigned_volunteer_id INT NULL,
    coordinator_id INT NULL,
    coordinator_notes TEXT NULL,
    resolution_notes TEXT NULL,
    resolution_photo VARCHAR(255) NULL,
    reporter_feedback TEXT NULL,
    reporter_rating INT NULL,
    reporter_confirmed_resolution BOOLEAN NULL,
    municipal_referral_status VARCHAR(150) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_volunteer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_report_status (status),
    INDEX idx_report_category (category),
    INDEX idx_report_public (is_public),
    INDEX idx_report_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Report Photographs Table
CREATE TABLE IF NOT EXISTS report_photographs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255) NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    photo_type ENUM('evidence', 'progress', 'resolution', 'before', 'after') DEFAULT 'evidence',
    uploaded_by_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_photo_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Status History Table
CREATE TABLE IF NOT EXISTS status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    previous_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by_id INT NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_history_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Community Confirmations Table
CREATE TABLE IF NOT EXISTS community_confirmations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_report_confirm (report_id, user_id),
    INDEX idx_confirm_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    photo_url VARCHAR(255) NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    moderated_by_id INT NULL,
    moderation_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (moderated_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_comments_report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Community Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    location_name VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    total_slots INT NOT NULL DEFAULT 30,
    coordinator_id INT NOT NULL,
    cover_image VARCHAR(255) NULL,
    status ENUM('Upcoming', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
    completion_summary TEXT NULL,
    waste_collected_kg DECIMAL(8, 2) DEFAULT 0,
    trees_planted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_events_date (event_date),
    INDEX idx_events_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_status ENUM('Registered', 'Attended', 'Cancelled', 'No Show') DEFAULT 'Registered',
    hours_contributed DECIMAL(4, 2) DEFAULT 0,
    feedback TEXT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_user (event_id, user_id),
    INDEX idx_reg_event (event_id),
    INDEX idx_reg_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Volunteer Assignments Table
CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    assigned_by_id INT NOT NULL,
    assignment_notes TEXT NULL,
    progress_status ENUM('Assigned', 'In Progress', 'Work Submitted', 'Verified') DEFAULT 'Assigned',
    completion_notes TEXT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_assign_report (report_id),
    INDEX idx_assign_volunteer (volunteer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link VARCHAR(255) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notify_user (user_id),
    INDEX idx_notify_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_id INT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
