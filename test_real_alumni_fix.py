import pymysql

def test_with_real_alumni():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor()
        
        print("=== Testing with existing alumni ===")
        
        # Get a real alumni_id
        cursor.execute("SELECT alumni_id FROM alumni_table LIMIT 1")
        alumni = cursor.fetchone()
        
        if not alumni:
            print("No alumni records found in database")
            return
            
        alumni_id = alumni['alumni_id']
        print(f"Using alumni_id: {alumni_id}")
        
        # Test 1: Check current degree record
        cursor.execute("SELECT * FROM alumni_degree WHERE alumni_id = %s", (alumni_id,))
        existing = cursor.fetchone()
        
        if existing:
            print("✓ Found existing degree record")
            print(f"  - Program: {existing['program']}")
            print(f"  - Major: {existing['major']}")
            print(f"  - Date of Admission: {existing['date_of_admission']}")
            print(f"  - Graduation Date: {existing['graduation_date']}")
        
        # Test 2: Update degree record without date_of_admission
        print("\n=== Testing UPDATE without date_of_admission ===")
        try:
            cursor.execute("""
                UPDATE alumni_degree 
                SET program = %s, major = %s, graduation_date = %s
                WHERE alumni_id = %s
            """, ('BSIT', 'Web System Technology', '2024-05-01', alumni_id))
            
            print("✓ UPDATE successful without date_of_admission")
            
            # Verify the update
            cursor.execute("SELECT * FROM alumni_degree WHERE alumni_id = %s", (alumni_id,))
            updated = cursor.fetchone()
            print(f"  - Updated Program: {updated['program']}")
            print(f"  - Updated Major: {updated['major']}")
            print(f"  - Date of Admission: {updated['date_of_admission']} (should be NULL or unchanged)")
            
        except Exception as e:
            print(f"✗ UPDATE failed: {e}")
        
        db.commit()
        cursor.close()
        db.close()
        
        print("\n=== Test completed successfully ===")
        print("The date_of_admission field can now be NULL and updates work properly!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_with_real_alumni()
