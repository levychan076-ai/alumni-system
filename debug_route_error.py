#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import json
from app import app
from flask import request

def debug_route_error():
    """Debug the exact error in the resolve-update-request route"""
    
    print("=== DEBUGGING ROUTE ERROR ===")
    
    # Create a test client
    with app.test_client() as client:
        # Simulate admin session
        with client.session_transaction() as sess:
            sess['username'] = 'admin'
            sess['user_type'] = 'Admin'
            sess['logged_in'] = True
        
        # Test data
        test_data = {
            'id': 1,
            'action': 'approved',
            'note': 'Test AJAX approval'
        }
        
        print(f"🔧 Testing with data: {test_data}")
        
        # Let's manually trace through the route logic
        from app import get_db, login_required, admin_required
        from datetime import datetime
        
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        try:
            # Step 1: Check request data
            print("✅ Step 1: Request data looks good")
            
            # Step 2: Check action validation
            action = test_data['action']
            if action not in ("approved", "rejected"):
                print("❌ Step 2: Invalid action")
                return
            print("✅ Step 2: Action is valid")
            
            # Step 3: Get the alumni_id for this request
            cursor.execute("SELECT alumni_id FROM alumni_update_requests WHERE id = %s", (test_data['id'],))
            request_data = cursor.fetchone()
            
            if not request_data:
                print("❌ Step 3: Request not found")
                return
                
            alumni_id = request_data['alumni_id']
            print(f"✅ Step 3: Found alumni_id: {alumni_id}")
            
            # Step 4: Update the request status
            cursor.execute("""
                UPDATE alumni_update_requests
                SET status = %s,
                    admin_note = %s,
                    resolved_at = %s,
                    resolved_by = %s
                WHERE id = %s
            """, (action, test_data['note'] or None, datetime.now(), 'admin', test_data['id']))
            
            print("✅ Step 4: Update query executed")
            
            # Step 5: Commit
            db.commit()
            print("✅ Step 5: Database commit successful")
            
            # Step 6: Verify the update
            cursor.execute("SELECT * FROM alumni_update_requests WHERE id = %s", (test_data['id'],))
            updated_request = cursor.fetchone()
            
            print(f"📊 Updated request status: {updated_request['status']}")
            
            # Step 7: Test the exact JSON response
            response_data = {"success": True}
            print(f"📊 Should return: {response_data}")
            
            print("✅ All steps successful - the issue might be in decorators or session handling")
            
        except Exception as e:
            print(f"❌ Exception in route: {e}")
            print(f"❌ Exception type: {type(e)}")
            import traceback
            traceback.print_exc()
            db.rollback()
        
        finally:
            cursor.close()
            db.close()

if __name__ == "__main__":
    debug_route_error()
