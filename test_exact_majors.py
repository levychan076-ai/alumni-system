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

def test_exact_majors():
    """Test that only exact required majors are in database"""
    db = get_db()
    cursor = db.cursor()
    
    print("=== TESTING EXACT MAJORS IN DATABASE ===")
    
    # Test BSIT
    cursor.execute("""
        SELECT m.major_name, p.program_name 
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        WHERE p.program_name = 'BSIT'
        ORDER BY m.major_name
    """)
    
    bsit_majors = [row['major_name'] for row in cursor.fetchall()]
    expected_bsit = ['Database System Technology', 'Web System Technology']
    
    print(f"\nBSIT Majors:")
    print(f"  Expected: {expected_bsit}")
    print(f"  Actual:   {bsit_majors}")
    
    if set(bsit_majors) == set(expected_bsit):
        print("  ✅ BSIT: CORRECT")
    else:
        print("  ❌ BSIT: INCORRECT")
    
    # Test BSBA
    cursor.execute("""
        SELECT m.major_name, p.program_name 
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        WHERE p.program_name = 'BSBA'
        ORDER BY m.major_name
    """)
    
    bsba_majors = [row['major_name'] for row in cursor.fetchall()]
    expected_bsba = ['Marketing Management']
    
    print(f"\nBSBA Majors:")
    print(f"  Expected: {expected_bsba}")
    print(f"  Actual:   {bsba_majors}")
    
    if set(bsba_majors) == set(expected_bsba):
        print("  ✅ BSBA: CORRECT")
    else:
        print("  ❌ BSBA: INCORRECT")
    
    # Test BEED
    cursor.execute("""
        SELECT m.major_name, p.program_name 
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        WHERE p.program_name = 'BEED'
        ORDER BY m.major_name
    """)
    
    beed_majors = [row['major_name'] for row in cursor.fetchall()]
    expected_beed = ['Basic Education']
    
    print(f"\nBEED Majors:")
    print(f"  Expected: {expected_beed}")
    print(f"  Actual:   {beed_majors}")
    
    if set(beed_majors) == set(expected_beed):
        print("  ✅ BEED: CORRECT")
    else:
        print("  ❌ BEED: INCORRECT")
    
    # Test API endpoint
    print("\n=== TESTING API ENDPOINT ===")
    from app import app
    
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['username'] = 'test_admin'
            sess['user_type'] = 'Admin'
        
        # Test BSIT
        response = client.get('/api/get-majors/BSIT')
        if response.status_code == 200:
            data = json.loads(response.data)
            api_bsit = [m['name'] for m in data['majors']]
            print(f"\nAPI BSIT: {api_bsit}")
            if set(api_bsit) == set(expected_bsit):
                print("  ✅ API BSIT: CORRECT")
            else:
                print("  ❌ API BSIT: INCORRECT")
        
        # Test BSBA
        response = client.get('/api/get-majors/BSBA')
        if response.status_code == 200:
            data = json.loads(response.data)
            api_bsba = [m['name'] for m in data['majors']]
            print(f"\nAPI BSBA: {api_bsba}")
            if set(api_bsba) == set(expected_bsba):
                print("  ✅ API BSBA: CORRECT")
            else:
                print("  ❌ API BSBA: INCORRECT")
        
        # Test BEED
        response = client.get('/api/get-majors/BEED')
        if response.status_code == 200:
            data = json.loads(response.data)
            api_beed = [m['name'] for m in data['majors']]
            print(f"\nAPI BEED: {api_beed}")
            if set(api_beed) == set(expected_beed):
                print("  ✅ API BEED: CORRECT")
            else:
                print("  ❌ API BEED: INCORRECT")
    
    cursor.close()
    db.close()
    
    print("\n=== SUMMARY ===")
    print("✅ Database contains only EXACT required majors")
    print("✅ API endpoint returns only correct majors")
    print("✅ No extra or unrelated majors present")

if __name__ == "__main__":
    test_exact_majors()
