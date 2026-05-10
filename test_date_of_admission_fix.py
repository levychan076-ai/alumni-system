import mysql.connector

def test_date_of_admission_fix():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor(dictionary=True)
        
        print("=== Testing date_of_admission fix ===")
        
        # Test 1: Check that column allows NULL
        cursor.execute("DESCRIBE alumni_degree")
        columns = cursor.fetchall()
        for col in columns:
            if col['Field'] == 'date_of_admission':
                print(f"✓ Column {col['Field']}: {col['Type']} NULL={col['Null']}")
                break
        
        # Test 2: Try to insert a record without date_of_admission
        print("\n=== Testing INSERT without date_of_admission ===")
        try:
            cursor.execute("""
                INSERT INTO alumni_degree 
                (alumni_id, program, major, graduation_date, added_by, date_added)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (99999, 'BSIT', 'Database System Technology', '2024-01-01', 'test_user', '2024-01-01'))
            
            # Check if insert was successful
            cursor.execute("SELECT * FROM alumni_degree WHERE alumni_id = 99999")
            result = cursor.fetchone()
            if result:
                print("✓ INSERT successful - date_of_admission is NULL:", result['date_of_admission'])
            else:
                print("✗ INSERT failed")
            
            # Clean up test record
            cursor.execute("DELETE FROM alumni_degree WHERE alumni_id = 99999")
            
        except Exception as e:
            print(f"✗ INSERT failed: {e}")
        
        # Test 3: Verify search query works without date_of_admission
        print("\n=== Testing search query ===")
        try:
            cursor.execute("""
                SELECT 
                    a.alumni_id, a.stud_num, a.last_name, a.first_name,
                    d.program, d.major, d.graduation_date,
                    CAST(d.graduation_date AS CHAR) as grad_date_char
                FROM alumni_table a
                LEFT JOIN alumni_degree d ON a.alumni_id = d.alumni_id
                LIMIT 5
            """)
            results = cursor.fetchall()
            print(f"✓ Search query works, found {len(results)} records")
            
        except Exception as e:
            print(f"✗ Search query failed: {e}")
        
        cursor.close()
        db.close()
        
        print("\n=== All tests completed ===")
        
    except Exception as e:
        print(f"Database connection error: {e}")

if __name__ == "__main__":
    test_date_of_admission_fix()
