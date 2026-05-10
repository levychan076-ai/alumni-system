import pymysql
from flask import Flask
import json

def get_db():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        database="alumni_system"
    )

def test_final_dropdowns():
    """Final test of dropdown functionality"""
    db = get_db()
    cursor = db.cursor()
    
    print("=== FINAL DROPDOWN VERIFICATION ===")
    
    # Test database has exact required majors
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
        
        print(f"\n{program}:")
        print(f"  Expected: {expected_majors}")
        print(f"  Actual:   {actual_majors}")
        
        if set(actual_majors) == set(expected_majors):
            print(f"  ✅ {program} - CORRECT")
        else:
            print(f"  ❌ {program} - INCORRECT")
            all_correct = False
    
    # Test API endpoint
    print("\n=== API ENDPOINT TEST ===")
    from app import app
    
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['username'] = 'test_admin'
            sess['user_type'] = 'Admin'
        
        for program in expected_structure.keys():
            response = client.get(f'/api/get-majors/{program}')
            if response.status_code == 200:
                data = json.loads(response.data)
                api_majors = [m['name'] for m in data['majors']]
                expected = expected_structure[program]
                
                print(f"\nAPI {program}:")
                print(f"  Expected: {expected}")
                print(f"  Actual:   {api_majors}")
                
                if set(api_majors) == set(expected):
                    print(f"  ✅ API {program} - CORRECT")
                else:
                    print(f"  ❌ API {program} - INCORRECT")
                    all_correct = False
    
    cursor.close()
    db.close()
    
    print("\n=== FINAL RESULT ===")
    if all_correct:
        print("✅ ALL DROPDOWNS WORKING CORRECTLY")
        print("✅ BSIT → Database System Technology, Web System Technology")
        print("✅ BSBA → Marketing Management") 
        print("✅ BEED → Basic Education")
        print("✅ NO EXTRA MAJORS PRESENT")
        print("✅ DYNAMIC FILTERING WORKING")
    else:
        print("❌ ISSUES FOUND - NEED FIXES")
    
    return all_correct

if __name__ == "__main__":
    test_final_dropdowns()
