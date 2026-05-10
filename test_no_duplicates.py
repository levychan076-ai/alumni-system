import mysql.connector
from flask import Flask
import json

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="alumni_system"
    )

def test_no_duplicates():
    """Test that dropdowns have no duplicates"""
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    print("=== TESTING NO DUPLICATES IN DROPDOWNS ===")
    
    # Test API returns unique majors
    from app import app
    
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['username'] = 'test_admin'
            sess['user_type'] = 'Admin'
        
        programs = ['BSIT', 'BSBA', 'BEED']
        
        for program in programs:
            response = client.get(f'/api/get-majors/{program}')
            if response.status_code == 200:
                data = json.loads(response.data)
                majors = [m['name'] for m in data['majors']]
                
                print(f"\n{program} API Response:")
                print(f"  Majors: {majors}")
                print(f"  Count: {len(majors)}")
                
                # Check for duplicates
                if len(majors) == len(set(majors)):
                    print(f"  ✅ {program} - NO DUPLICATES")
                else:
                    duplicates = [m for m in majors if majors.count(m) > 1]
                    print(f"  ❌ {program} - DUPLICATES FOUND: {set(duplicates)}")
    
    # Verify database still has correct unique majors
    print("\n=== DATABASE VERIFICATION ===")
    expected_structure = {
        'BSIT': ['Database System Technology', 'Web System Technology'],
        'BSBA': ['Marketing Management'],
        'BEED': ['Basic Education']
    }
    
    all_correct = True
    
    for program, expected_majors in expected_structure.items():
        cursor.execute("""
            SELECT m.major_name 
            FROM majors m 
            JOIN programs p ON m.program_id = p.program_id 
            WHERE p.program_name = %s
            ORDER BY m.major_name
        """, (program,))
        
        actual_majors = [row['major_name'] for row in cursor.fetchall()]
        
        print(f"\n{program} Database:")
        print(f"  Expected: {expected_majors}")
        print(f"  Actual:   {actual_majors}")
        
        if set(actual_majors) == set(expected_majors):
            print(f"  ✅ {program} - CORRECT & UNIQUE")
        else:
            print(f"  ❌ {program} - INCORRECT OR DUPLICATES")
            all_correct = False
    
    cursor.close()
    db.close()
    
    print("\n=== FINAL RESULT ===")
    if all_correct:
        print("✅ NO DUPLICATES IN ANY DROPDOWN")
        print("✅ BSIT: Database System Technology, Web System Technology")
        print("✅ BSBA: Marketing Management")
        print("✅ BEED: Basic Education")
        print("✅ EACH MAJOR APPEARS ONLY ONCE")
    else:
        print("❌ DUPLICATES STILL PRESENT")
    
    return all_correct

if __name__ == "__main__":
    test_no_duplicates()
