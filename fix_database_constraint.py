import pymysql

def fix_date_of_admission_constraint():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor()
        
        print("Fixing date_of_admission constraint...")
        
        # Alter the column to allow NULL values
        cursor.execute("""
            ALTER TABLE alumni_degree 
            MODIFY COLUMN date_of_admission DATE NULL
        """)
        
        print("Successfully modified date_of_admission column to allow NULL values")
        
        # Verify the change
        cursor.execute("DESCRIBE alumni_degree")
        columns = cursor.fetchall()
        print("\n=== Updated alumni_degree schema ===")
        for col in columns:
            if col[0] == 'date_of_admission':
                print(f"{col[0]}: {col[1]} {col[2]} {col[3]}")
                break
        
        db.commit()
        cursor.close()
        db.close()
        
        print("Database constraint fixed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_date_of_admission_constraint()
