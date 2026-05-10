-- Create programs and majors tables for admin management
-- Run this SQL script to create the necessary tables

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_name VARCHAR(100) NOT NULL UNIQUE,
    program_description TEXT,
    created_by VARCHAR(50),
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_program_name (program_name)
);

-- Majors table
CREATE TABLE IF NOT EXISTS majors (
    major_id INT AUTO_INCREMENT PRIMARY KEY,
    major_name VARCHAR(100) NOT NULL,
    program_id INT NOT NULL,
    major_description TEXT,
    created_by VARCHAR(50),
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE,
    UNIQUE KEY unique_major_program (major_name, program_id),
    INDEX idx_major_name (major_name),
    INDEX idx_program_id (program_id)
);

-- Insert default programs if they don't exist
INSERT IGNORE INTO programs (program_name, program_description, created_by) VALUES
('BSIT', 'Bachelor of Science in Information Technology', 'system'),
('BSBA', 'Bachelor of Science in Business Administration', 'system'),
('BEED', 'Bachelor of Elementary Education', 'system');
