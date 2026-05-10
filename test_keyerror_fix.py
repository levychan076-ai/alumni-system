import pymysql
import urllib.request
import urllib.error

def test_keyerror_fix():
    """Test that KeyError: 2 is fixed"""
    
    print("=== TESTING KEYERROR FIX ===")
    
    try:
        # Test 1: Database query with dictionary cursor
        db = pymysql.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor()
        
        # Test the exact query used by Records route
        cursor.execute("""
            SELECT
                a.alumni_id, a.stud_num, a.photo, a.last_name, a.first_name, a.middle_name,
                a.address, a.email, a.contact_num, a.added_by, a.date_added,
                d.program, d.major, d.date_of_admission, d.graduation_date,
                e.employment_status, e.job_title, e.employment_sector, e.degree_relevance_to_work
            FROM alumni_table a
            LEFT JOIN alumni_degree d ON a.alumni_id = d.alumni_id
            LEFT JOIN alumni_employment e ON a.alumni_id = e.alumni_id
            WHERE a.photo IS NOT NULL AND a.photo != ''
            LIMIT 3
        """)
        
        raw_records = cursor.fetchall()
        print(f"✓ Query executed successfully, found {len(raw_records)} records")
        
        # Test 2: Simulate the Records route logic
        formatted_records = []
        for i, row in enumerate(raw_records, start=1):
            print(f"\nProcessing record {i}:")
            print(f"  Row type: {type(row)}")
            print(f"  Row keys: {list(row.keys())}")
            
            # Test the fixed logic
            try:
                photo_path = row.get('photo', '')
                print(f"  ✓ Photo path: {photo_path}")
                
                if photo_path:
                    photo_url = f"/static/uploads/{photo_path}"
                    print(f"  ✓ Photo URL: {photo_url}")
                else:
                    photo_url = "/static/images/default-avatar.svg"
                    print(f"  ✓ Default avatar URL: {photo_url}")
                
                # Test tuple creation (this is what Records route does)
                formatted_record = (
                    i,  # [0]  display row number
                    row.get('alumni_id', ''),  # [1]  alumni_id
                    row.get('stud_num', ''),  # [2]  stud_num
                    photo_url,  # [3]  photo URL (2x2 display)
                    row.get('last_name', ''),  # [4]  last_name
                    row.get('first_name', ''),  # [5]  first_name
                    row.get('middle_name', ''),  # [6]  middle_name
                    row.get('address', ''),  # [7]  address
                    row.get('email', ''),  # [8]  email
                    row.get('contact_num', ''),  # [9]  contact_num
                    row.get('added_by', ''),  # [10]  added_by
                    row.get('date_added', ''),  # [11]  date_added
                    row.get('program', ''),  # [12]  program
                    row.get('major', ''),  # [13]  major
                    row.get('employment_status', ''),  # [14]  employment_status
                    row.get('job_title', ''),  # [15]  job_title
                    row.get('employment_sector', ''),  # [16]  employment_sector
                    row.get('degree_relevance_to_work', ''),  # [17]  work relevance
                )
                
                formatted_records.append(formatted_record)
                print(f"  ✓ Formatted record created successfully")
                
            except KeyError as e:
                print(f"  ✗ KeyError: {e}")
                return False
            except Exception as e:
                print(f"  ✗ Other error: {e}")
                return False
        
        cursor.close()
        db.close()
        
        print(f"\n✓ All {len(formatted_records)} records processed without KeyError")
        
        # Test 3: Check if Records page works
        try:
            records_url = "http://127.0.0.1:5000/records"
            response = urllib.request.urlopen(records_url, timeout=5)
            status = response.getcode()
            
            if status == 200:
                print("✓ Records page accessible")
                content = response.read().decode('utf-8')
                
                if 'KeyError' in content:
                    print("✗ KeyError still present in page")
                    return False
                elif 'static/uploads' in content:
                    print("✓ Image URLs found in page")
                else:
                    print("? No image URLs found in page")
                    
            elif status == 302:
                print("✓ Records page redirecting to login (expected)")
            else:
                print(f"✗ Records page returned status {status}")
                return False
                
        except Exception as e:
            print(f"✗ Records page test failed: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_keyerror_fix()
    if success:
        print("\n🎉 KEYERROR FIX SUCCESSFUL!")
        print("Dictionary access is working correctly.")
        print("Records page should load without KeyError: 2")
    else:
        print("\n❌ KEYERROR FIX FAILED!")
