import pymysql

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="alumni_system"
    )

def check_table_structure():
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Check alumni_table structure
        print("=== alumni_table structure ===")
        cursor.execute("DESCRIBE alumni_table")
        alumni_columns = cursor.fetchall()
        for col in alumni_columns:
            print(f"  {col['Field']} - {col['Type']} - {col['Null']} - {col['Key']}")
        
        print("\n=== alumni_degree structure ===")
        cursor.execute("DESCRIBE alumni_degree")
        degree_columns = cursor.fetchall()
        for col in degree_columns:
            print(f"  {col['Field']} - {col['Type']} - {col['Null']} - {col['Key']}")
            
        print("\n=== alumni_employment structure ===")
        cursor.execute("DESCRIBE alumni_employment")
        employment_columns = cursor.fetchall()
        for col in employment_columns:
            print(f"  {col['Field']} - {col['Type']} - {col['Null']} - {col['Key']}")
        
        # Check if updated_by and date_updated columns exist
        alumni_fields = [col['Field'] for col in alumni_columns]
        degree_fields = [col['Field'] for col in degree_columns]
        employment_fields = [col['Field'] for col in employment_columns]
        
        print("\n=== Missing Columns Analysis ===")
        print(f"alumni_table missing updated_by: {'updated_by' not in alumni_fields}")
        print(f"alumni_table missing date_updated: {'date_updated' not in alumni_fields}")
        print(f"alumni_degree missing updated_by: {'updated_by' not in degree_fields}")
        print(f"alumni_degree missing date_updated: {'date_updated' not in degree_fields}")
        print(f"alumni_employment missing updated_by: {'updated_by' not in employment_fields}")
        print(f"alumni_employment missing date_updated: {'date_updated' not in employment_fields}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        db.close()

def add_missing_columns():
    db = get_db()
    cursor = db.cursor()
    
    try:
        print("\n=== Adding missing columns ===")
        
        # Add columns to alumni_table
        try:
            cursor.execute("ALTER TABLE alumni_table ADD COLUMN updated_by VARCHAR(255) NULL")
            print("✓ Added updated_by to alumni_table")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("✓ updated_by already exists in alumni_table")
            else:
                print(f"✗ Error adding updated_by to alumni_table: {e}")
        
        try:
            cursor.execute("ALTER TABLE alumni_table ADD COLUMN date_updated DATETIME NULL")
            print("✓ Added date_updated to alumni_table")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("✓ date_updated already exists in alumni_table")
            else:
                print(f"✗ Error adding date_updated to alumni_table: {e}")
        
        # Add columns to alumni_degree
        try:
            cursor.execute("ALTER TABLE alumni_degree ADD COLUMN updated_by VARCHAR(255) NULL")
            print("✓ Added updated_by to alumni_degree")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("✓ updated_by already exists in alumni_degree")
            else:
                print(f"✗ Error adding updated_by to alumni_degree: {e}")
        
        try:
            cursor.execute("ALTER TABLE alumni_degree ADD COLUMN date_updated DATETIME NULL")
            print("✓ Added date_updated to alumni_degree")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("✓ date_updated already exists in alumni_degree")
            else:
                print(f"✗ Error adding date_updated to alumni_degree: {e}")
        
        # Add columns to alumni_employment
        try:
            cursor.execute("ALTER TABLE alumni_employment ADD COLUMN updated_by VARCHAR(255) NULL")
            print("✓ Added updated_by to alumni_employment")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("✓ updated_by already exists in alumni_employment")
            else:
                print(f"✗ Error adding updated_by to alumni_employment: {e}")
        
        try:
            cursor.execute("ALTER TABLE alumni_employment ADD COLUMN date_updated DATETIME NULL")
            print("✓ Added date_updated to alumni_employment")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("✓ date_updated already exists in alumni_employment")
            else:
                print(f"✗ Error adding date_updated to alumni_employment: {e}")
        
        db.commit()
        print("\n✓ Database structure updated successfully!")
        
    except Exception as e:
        print(f"Error updating database: {e}")
        db.rollback()
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    print("Checking database structure...")
    check_table_structure()
    
    print("\n" + "="*50)
    response = input("Do you want to add missing columns? (y/n): ")
    if response.lower() == 'y':
        add_missing_columns()
        print("\nRechecking structure after updates...")
        check_table_structure()
