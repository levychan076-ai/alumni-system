#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import json
from app import app

def test_with_real_session():
    """Test with proper session setup"""
    
    print("=== TESTING WITH REAL SESSION ===")
    
    # Create a test client
    with app.test_client() as client:
        # First, let's check if we can access the route at all
        response = client.get('/alumni-notif')
        print(f"📊 GET /alumni-notif status: {response.status_code}")
        
        if response.status_code == 302:
            print("📊 Redirecting to login - need to login first")
            # Try to login as admin
            login_data = {
                'username': 'admin',
                'password': 'admin123'  # Assuming default admin credentials
            }
            
            login_response = client.post('/login', data=login_data)
            print(f"📊 Login response status: {login_response.status_code}")
            
            if login_response.status_code == 302:
                print("✅ Login successful, trying again...")
                
                # Now try the AJAX endpoint
                test_data = {
                    'id': 1,
                    'action': 'approved',
                    'note': 'Test AJAX approval'
                }
                
                ajax_response = client.post(
                    '/api/resolve-update-request',
                    data=json.dumps(test_data),
                    content_type='application/json'
                )
                
                print(f"📊 AJAX response status: {ajax_response.status_code}")
                print(f"📊 AJAX response data: {ajax_response.get_json()}")
                
                if ajax_response.status_code == 200:
                    data = ajax_response.get_json()
                    if data.get('success'):
                        print("✅ SUCCESS: AJAX endpoint works with proper session!")
                    else:
                        print(f"❌ FAILED: {data.get('error')}")
                else:
                    print(f"❌ HTTP ERROR: {ajax_response.status_code}")
            else:
                print(f"❌ Login failed: {login_response.status_code}")
        else:
            print("📊 Already logged in or no auth required")

if __name__ == "__main__":
    test_with_real_session()
