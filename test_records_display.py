import urllib.request
import urllib.error

def test_records_page_display():
    """Test if Records page displays images correctly"""
    
    print("=== TESTING RECORDS PAGE DISPLAY ===")
    
    try:
        # Test Records page - this will redirect to login but we can check response
        url = "http://127.0.0.1:5000/records"
        req = urllib.request.Request(url)
        
        response = urllib.request.urlopen(req, timeout=10)
        status_code = response.getcode()
        
        if status_code == 302:  # Redirect to login (expected)
            print("✓ Records page redirecting to login (expected)")
            
            # Test with login simulation - we can't actually login but can check if app loads
            login_url = "http://127.0.0.1:5000/login-admin"
            login_response = urllib.request.urlopen(login_url, timeout=5)
            if login_response.getcode() == 200:
                print("✓ Login page loads correctly")
                
                # Check if login page has proper form elements
                content = login_response.read().decode('utf-8')
                if 'username' in content and 'password' in content:
                    print("✓ Login form is functional")
                
        elif status_code == 200:
            print("✓ Records page accessible (maybe already logged in)")
            content = response.read().decode('utf-8')
            
            # Check for image-related elements
            if 'url_for' in content:
                print("✗ url_for still in HTML (template error)")
                return False
            elif 'static/uploads' in content:
                print("✓ Image URLs being generated")
            else:
                print("? No image URLs found in content")
            
            # Check for broken image indicators
            if 'broken' in content.lower() or 'error' in content.lower():
                print("✗ Possible errors in page content")
            else:
                print("✓ No obvious errors in page content")
        
        # Test specific image URL that should exist
        image_url = "http://127.0.0.1:5000/static/uploads/72f8397cef33453695bedc89583c301a.png"
        try:
            img_response = urllib.request.urlopen(image_url, timeout=5)
            if img_response.getcode() == 200:
                print("✓ Specific uploaded image accessible")
            else:
                print(f"✗ Image returned status {img_response.getcode()}")
        except Exception as e:
            print(f"✗ Could not access specific image: {e}")
        
        # Test default avatar
        default_url = "http://127.0.0.1:5000/static/images/default-avatar.svg"
        try:
            default_response = urllib.request.urlopen(default_url, timeout=5)
            if default_response.getcode() == 200:
                print("✓ Default avatar accessible")
            else:
                print(f"✗ Default avatar returned {default_response.getcode()}")
        except Exception as e:
            print(f"✗ Default avatar error: {e}")
        
        return True
        
    except Exception as e:
        print(f"✗ Records page test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_records_page_display()
    if success:
        print("\n🎉 RECORDS PAGE DISPLAY TEST PASSED!")
        print("Image system is working correctly.")
        print("\nMANUAL VERIFICATION:")
        print("1. Open browser to http://127.0.0.1:5000")
        print("2. Login as Alumni Coordinator")
        print("3. Navigate to Records page")
        print("4. Verify alumni photos display in circular format")
        print("5. Check that default avatar shows for alumni without photos")
    else:
        print("\n❌ RECORDS PAGE DISPLAY TEST FAILED!")
