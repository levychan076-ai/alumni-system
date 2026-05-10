import requests
import os

def test_image_upload_and_display():
    """Test the complete image upload and display system"""
    
    base_url = "http://127.0.0.1:5000"
    
    print("=== Testing Alumni Image System ===")
    
    # Test 1: Check if Flask app is accessible
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            print("✓ Flask app is running")
        else:
            print(f"✗ Flask app returned status {response.status_code}")
            return
    except Exception as e:
        print(f"✗ Cannot connect to Flask app: {e}")
        return
    
    # Test 2: Check if static files are accessible
    try:
        # Test default avatar
        default_avatar_url = f"{base_url}/static/images/default-avatar.svg"
        response = requests.get(default_avatar_url, timeout=5)
        if response.status_code == 200:
            print("✓ Default avatar is accessible")
        else:
            print(f"✗ Default avatar returned status {response.status_code}")
        
        # Test existing uploaded image
        test_image_url = f"{base_url}/static/uploads/72f8397cef33453695bedc89583c301a.png"
        response = requests.get(test_image_url, timeout=5)
        if response.status_code == 200:
            print("✓ Existing uploaded image is accessible")
        else:
            print(f"✗ Existing uploaded image returned status {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error accessing static files: {e}")
    
    # Test 3: Check uploads folder permissions
    uploads_path = "static/uploads"
    if os.path.exists(uploads_path):
        if os.access(uploads_path, os.W_OK):
            print("✓ Uploads folder is writable")
        else:
            print("✗ Uploads folder is not writable")
    else:
        print("✗ Uploads folder does not exist")
    
    print("\n=== Image System Test Complete ===")
    print("Manual testing required:")
    print("1. Login as Alumni Coordinator")
    print("2. Navigate to Records page")
    print("3. Check if alumni photos display correctly")
    print("4. Try adding new alumni with photo")
    print("5. Try updating existing alumni photo")

if __name__ == "__main__":
    test_image_upload_and_display()
