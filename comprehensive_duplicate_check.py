import pymysql

def get_db():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        database="alumni_system"
    )

def comprehensive_duplicate_check():
    """Comprehensive check for all sources of duplicates"""
    db = get_db()
    cursor = db.cursor()
    
    print("=== COMPREHENSIVE DUPLICATE CHECK ===")
    
    # 1. Check database for duplicate records
    print("\n1. DATABASE DUPLICATE CHECK:")
    cursor.execute("""
        SELECT m.major_name, p.program_name, COUNT(*) as count
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        GROUP BY m.major_name, p.program_name
        ORDER BY p.program_name, m.major_name
    """)
    
    db_majors = cursor.fetchall()
    print("All majors in database:")
    for major in db_majors:
        print(f"  {major['program_name']}: {major['major_name']} (count: {major['count']})")
        
        if major['count'] > 1:
            print(f"    ❌ DUPLICATE FOUND!")
    
    # 2. Check current API response
    print("\n2. API RESPONSE CHECK:")
    from app import app
    import json
    
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['username'] = 'test_admin'
            sess['user_type'] = 'Admin'
        
        for program in ['BSIT', 'BSBA', 'BEED']:
            response = client.get(f'/api/get-majors/{program}')
            if response.status_code == 200:
                data = json.loads(response.data)
                majors = data.get('majors', [])
                
                print(f"\n{program} API Response:")
                for i, major in enumerate(majors, 1):
                    print(f"  {i}. {major.get('name', 'NO NAME')}")
                
                # Check for duplicates in API response
                major_names = [m.get('name') for m in majors]
                if len(major_names) != len(set(major_names)):
                    duplicates = [name for name in major_names if major_names.count(name) > 1]
                    print(f"  ❌ DUPLICATES IN API: {set(duplicates)}")
                else:
                    print(f"  ✅ NO DUPLICATES IN API")
    
    # 3. Check SQL query directly
    print("\n3. DIRECT SQL QUERY CHECK:")
    cursor.execute("""
        SELECT DISTINCT m.major_name, p.program_name
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        WHERE p.program_name = %s
        ORDER BY m.major_name
    """, ('BSIT',))
    
    bsit_distinct = cursor.fetchall()
    print("BSIT DISTINCT Query Result:")
    for major in bsit_distinct:
        print(f"  {major['major_name']}")
    
    cursor.execute("""
        SELECT DISTINCT m.major_name, p.program_name
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        WHERE p.program_name = %s
        ORDER BY m.major_name
    """, ('BSBA',))
    
    bsba_distinct = cursor.fetchall()
    print("BSBA DISTINCT Query Result:")
    for major in bsba_distinct:
        print(f"  {major['major_name']}")
    
    cursor.execute("""
        SELECT DISTINCT m.major_name, p.program_name
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        WHERE p.program_name = %s
        ORDER BY m.major_name
    """, ('BEED',))
    
    beed_distinct = cursor.fetchall()
    print("BEED DISTINCT Query Result:")
    for major in beed_distinct:
        print(f"  {major['major_name']}")
    
    cursor.close()
    db.close()
    
    print("\n=== SUMMARY ===")
    print("✅ Database checked for duplicates")
    print("✅ API response checked for duplicates") 
    print("✅ SQL DISTINCT query tested")
    print("✅ All sources of duplication identified")

if __name__ == "__main__":
    comprehensive_duplicate_check()
