-- Create announcement_requests table for approval workflow
CREATE TABLE IF NOT EXISTS announcement_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coordinator_id VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_emails TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_note TEXT,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    approved_at DATE,
    approved_by VARCHAR(100),
    FOREIGN KEY (coordinator_id) REFERENCES user_login(username)
);
