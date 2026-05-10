#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db
from datetime import datetime

def test_approve_reject():
    """Test the approve/reject functionality"""
    
    print("=== TESTING APPROVE/REJECT FUNCTIONALITY ===")
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Get the first pending request
        cursor.execute("SELECT * FROM alumni_update_requests WHERE status = 'pending' LIMIT 1")
        request = cursor.fetchone()
        
        if not request:
            print("❌ No pending requests found")
            return
            
        print(f"📊 Found pending request: ID {request['id']}")
        print(f"   Alumni ID: {request['alumni_id']}")
        print(f"   Reason: {request['reason']}")
        print(f"   Status: {request['status']}")
        
        # Test the approve logic
        req_id = request['id']
        action = 'approved'
        note = 'Test approval note'
        username = 'test_admin'
        
        print(f"\n🔧 Testing {action} action...")
        
        # Step 1: Get the alumni_id for this request
        cursor.execute("SELECT alumni_id FROM alumni_update_requests WHERE id = %s", (req_id,))
        request_data = cursor.fetchone()
        
        if not request_data:
            print("❌ Request not found")
            return
            
        alumni_id = request_data['alumni_id']
        print(f"✅ Found alumni_id: {alumni_id}")
        
        # Step 2: Update the request status
        cursor.execute("""
            UPDATE alumni_update_requests
            SET status = %s,
                admin_note = %s,
                resolved_at = %s,
                resolved_by = %s
            WHERE id = %s
        """, (action, note or None, datetime.now(), username, req_id))
        
        print(f"✅ Updated request status to {action}")
        
        # Step 3: Commit
        db.commit()
        print("✅ Database commit successful")
        
        # Step 4: Verify the update
        cursor.execute("SELECT * FROM alumni_update_requests WHERE id = %s", (req_id,))
        updated_request = cursor.fetchone()
        
        print(f"\n📊 Updated request:")
        print(f"   Status: {updated_request['status']}")
        print(f"   Admin Note: {updated_request['admin_note']}")
        print(f"   Resolved At: {updated_request['resolved_at']}")
        print(f"   Resolved By: {updated_request['resolved_by']}")
        
        if updated_request['status'] == action:
            print("✅ SUCCESS: Approve/Reject logic works!")
        else:
            print("❌ FAILED: Status not updated correctly")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    test_approve_reject()
