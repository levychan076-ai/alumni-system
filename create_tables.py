import pymysql

def create_missing_tables():
    try:
        db = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='alumni_system'
        )
        cursor = db.cursor()
        
        # Create alumni_notifications table
        cursor.execute('''
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
            )
        ''')
        
        # Create activity_logs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                user_type VARCHAR(50) NOT NULL,
                activity TEXT NOT NULL,
                date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (username) REFERENCES user_login(username)
            )
        ''')
        
        db.commit()
        print('Tables created successfully!')
        
    except Exception as e:
        print(f'Error: {e}')
    finally:
        if 'db' in locals():
            db.close()

if __name__ == '__main__':
    create_missing_tables()
