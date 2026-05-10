import pymysql

def check_cursor_and_results():
    """Check actual cursor type and database result structure"""
    
    try:
        db = pymysql.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        
        print("=== CHECKING CURSOR TYPES ===")
        
        # Test 1: Regular cursor (no )
        cursor1 = db.cursor()
        cursor1.execute("SELECT alumni_id, stud_num, photo FROM alumni_table LIMIT 1")
        result1 = cursor1.fetchone()
        print(f"Regular cursor result type: {type(result1)}")
        print(f"Regular cursor result: {result1}")
        
        if result1:
            print(f"  Access by index: result1[0] = {result1[0]}")
            try:
                print(f"  Access by key: result1['alumni_id'] = {result1['alumni_id']}")
            except Exception as e:
                print(f"  Access by key failed: {e}")
        cursor1.close()
        
        # Test 2: Dictionary cursor
        cursor2 = db.cursor()
        cursor2.execute("SELECT alumni_id, stud_num, photo FROM alumni_table LIMIT 1")
        result2 = cursor2.fetchone()
        print(f"\nDictionary cursor result type: {type(result2)}")
        print(f"Dictionary cursor result: {result2}")
        
        if result2:
            print(f"  Access by key: result2['alumni_id'] = {result2['alumni_id']}")
            try:
                print(f"  Access by index: result2[0] = {result2[0]}")
            except Exception as e:
                print(f"  Access by index failed: {e}")
        cursor2.close()
        
        # Test 3: Check actual app.py cursor usage
        print("\n=== CHECKING APP.PY CURSOR USAGE ===")
        
        # Check records route cursor
        cursor3 = db.cursor()  # This is what app.py uses
        cursor3.execute("""
            SELECT
                a.alumni_id, a.stud_num, a.photo, a.last_name, a.first_name, a.middle_name,
                a.address, a.email, a.contact_num, a.added_by, a.date_added,
                d.program, d.major, d.date_of_admission, d.graduation_date,
                e.employment_status, e.job_title, e.employment_sector, e.degree_relevance_to_work
            FROM alumni_table a
            LEFT JOIN alumni_degree d ON a.alumni_id = d.alumni_id
            LEFT JOIN alumni_employment e ON a.alumni_id = e.alumni_id
            WHERE a.photo IS NOT NULL AND a.photo != ''
            LIMIT 1
        """)
        result3 = cursor3.fetchone()
        print(f"App cursor result type: {type(result3)}")
        print(f"App cursor result: {result3}")
        
        if result3:
            print(f"  Photo by key: result3['photo'] = {result3['photo']}")
            try:
                print(f"  Photo by index: result3[2] = {result3[2]}")
            except Exception as e:
                print(f"  Photo by index failed: {e}")
        
        cursor3.close()
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_cursor_and_results()
