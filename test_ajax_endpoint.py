#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import json
from app import app

def test_ajax_endpoint():
    """Test the actual AJAX endpoint that handles approve/reject"""
    
    print("=== TESTING AJAX ENDPOINT ===")
    
    # Create a test client
    with app.test_client() as client:
        # Simulate admin session
        with client.session_transaction() as sess:
            sess['username'] = 'admin'
            sess['user_type'] = 'Admin'
            sess['logged_in'] = True
        
        # Get a pending request ID
        from app import get_db
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id FROM alumni_update_requests WHERE status = 'pending' LIMIT 1")
        request = cursor.fetchone()
        cursor.close()
        db.close()
        
        if not request:
            print("❌ No pending requests found")
            return
            
        req_id = request['id']
        print(f"📊 Testing with request ID: {req_id}")
        
        # Test the AJAX endpoint
        test_data = {
            'id': req_id,
            'action': 'approved',
            'note': 'Test AJAX approval'
        }
        
        print(f"🔧 Sending data: {test_data}")
        
        response = client.post(
            '/api/resolve-update-request',
            data=json.dumps(test_data),
            content_type='application/json'
        )
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📊 Response data: {response.get_json()}")
        
        if response.status_code == 200:
            data = response.get_json()
            if data.get('success'):
                print("✅ SUCCESS: AJAX endpoint works!")
            else:
                print(f"❌ FAILED: {data.get('error')}")
        else:
            print(f"❌ HTTP ERROR: {response.status_code}")

if __name__ == "__main__":
    test_ajax_endpoint()
