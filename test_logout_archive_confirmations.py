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

def test_logout_archive_confirmations():
    """Test logout and archive confirmation dialogs"""
    db = get_db()
    cursor = db.cursor()
    
    print("=== LOGOUT AND ARCHIVE CONFIRMATION TEST ===")
    
    # Test that Records page loads
    from app import app
    
    with app.test_client() as client:
        # Test Records page loads
        response = client.get('/records')
        print(f"\nRecords page status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.data.decode('utf-8')
            
            # Check if SweetAlert2 is loaded
            if 'sweetalert2' in content:
                print("✅ SweetAlert2 loaded")
            else:
                print("❌ SweetAlert2 missing")
            
            # Check if logout button exists
            if 'id="logoutBtn"' in content:
                print("✅ Logout button has correct ID")
            else:
                print("❌ Logout button missing ID")
            
            # Check if confirmLogout function exists
            if 'function confirmLogout()' in content:
                print("✅ confirmLogout function exists")
            else:
                print("❌ confirmLogout function missing")
            
            # Check if confirmArchive function exists
            if 'function confirmArchive(' in content:
                print("✅ confirmArchive function exists")
            else:
                print("❌ confirmArchive function missing")
            
            # Check if old confirm() is removed from archive button
            if 'onclick="return confirm(' in content:
                print("❌ Old confirm() still present in archive")
            else:
                print("✅ Old confirm() removed from archive")
            
            # Check if SweetAlert2 is used in confirmations
            if 'Swal.fire(' in content:
                print("✅ SweetAlert2 used in confirmations")
            else:
                print("❌ SweetAlert2 not used in confirmations")
            
            # Check for success popup implementation
            if 'Swal.fire({' in content and 'Alumni record archived successfully' in content:
                print("✅ Success popup implemented for archive")
            else:
                print("❌ Success popup missing for archive")
        
        cursor.close()
        db.close()
    
    print("\n=== EXPECTED RESULT ===")
    print("✅ Logout button with SweetAlert2 confirmation")
    print("✅ Archive button with modern SweetAlert2 confirmation")
    print("✅ Success messages look cleaner and professional")
    print("✅ Cancel actions work correctly")
    print("✅ Existing functionality remains working")

if __name__ == "__main__":
    test_logout_archive_confirmations()
