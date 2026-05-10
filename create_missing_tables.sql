-- Create missing database tables for alumni tracking system

-- Create alumni_notifications table for update requests
CREATE TABLE IF NOT EXISTS alumni_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumni_id INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (alumni_id) REFERENCES alumni_table(alumni_id),
    FOREIGN KEY (username) REFERENCES user_login(username)
);

-- Create activity_logs table for tracking all user activities
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    activity TEXT NOT NULL,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES user_login(username)
);

-- Insert sample activity log if table is empty
INSERT IGNORE INTO activity_logs (username, user_type, activity, date_time)
VALUES ('admin', 'ADMIN', 'System initialized', NOW());
