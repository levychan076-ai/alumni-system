import mysql.connector

def check_alumni_table_schema():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor(dictionary=True)
        
        # Check alumni_table structure
        cursor.execute("DESCRIBE alumni_table")
        columns = cursor.fetchall()
        print("=== alumni_table schema ===")
        for col in columns:
            print(f"{col['Field']}: {col['Type']} {col['Null']} {col['Key']}")
        
        # Check if photo column exists
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'alumni_system' 
            AND TABLE_NAME = 'alumni_table' 
            AND COLUMN_NAME = 'photo'
        """)
        photo_col = cursor.fetchone()
        print(f"\n=== Photo column ===")
        if photo_col:
            print(f"Found: {photo_col}")
        else:
            print("Photo column NOT found!")
        
        # Check sample data
        cursor.execute("SELECT alumni_id, photo FROM alumni_table LIMIT 5")
        sample_data = cursor.fetchall()
        print(f"\n=== Sample photo data ===")
        for row in sample_data:
            print(f"ID: {row['alumni_id']}, Photo: {row['photo']}")
        
        cursor.close()
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_alumni_table_schema()
