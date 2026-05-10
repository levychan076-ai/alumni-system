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

def test_update_navigation():
    """Test Update Alumni page navigation buttons"""
    db = get_db()
    cursor = db.cursor()
    
    print("=== UPDATE ALUMNI NAVIGATION TEST ===")
    
    # Test that update route exists
    from app import app
    
    with app.test_client() as client:
        # Test update page loads
        response = client.get('/update/1')
        print(f"\nUpdate page status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.data.decode('utf-8')
            
            # Check if Back button is removed
            if 'back-btn' in content:
                print("❌ Back button still present")
            else:
                print("✅ Back button removed")
            
            # Check if Cancel button exists
            if 'cancel-btn' in content:
                print("✅ Cancel button present")
            else:
                print("❌ Cancel button missing")
            
            # Check if Save Changes button exists
            if 'submit-btn' in content:
                print("✅ Save Changes button present")
            else:
                print("❌ Save Changes button missing")
            
            # Check if SweetAlert2 is loaded
            if 'sweetalert2' in content:
                print("✅ SweetAlert2 loaded")
            else:
                print("❌ SweetAlert2 missing")
            
            # Check if cancelBtn id exists
            if 'id="cancelBtn"' in content:
                print("✅ Cancel button has correct ID")
            else:
                print("❌ Cancel button missing ID")
        
        cursor.close()
        db.close()
    
    print("\n=== EXPECTED RESULT ===")
    print("✅ NO Back button")
    print("✅ Cancel button with SweetAlert2 confirmation")
    print("✅ Save Changes button present")
    print("✅ Only Cancel and Save Changes buttons visible")

if __name__ == "__main__":
    test_update_navigation()
