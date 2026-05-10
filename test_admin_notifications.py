#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db

def test_admin_notifications():
    """Test if requests appear in Admin Notifications"""
    
    print("=== TESTING ADMIN NOTIFICATIONS FLOW ===")
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Test the exact query used in alumni_notif route
        cursor.execute("""
            SELECT
                r.id,
                r.alumni_id,
                r.reason,
                r.status,
                r.admin_note,
                r.requested_at,
                r.resolved_at,
                r.resolved_by,
                CONCAT(a.first_name, ' ', a.last_name) AS full_name,
                a.stud_num,
                a.photo
            FROM alumni_update_requests r
            LEFT JOIN alumni_table a ON r.alumni_id = a.alumni_id
            WHERE r.status = 'pending'
            ORDER BY r.requested_at DESC
        """)
        
        notifications = cursor.fetchall()
        print(f"📊 Pending notifications found: {len(notifications)}")
        
        for notif in notifications:
            print(f"  - ID: {notif['id']}")
            print(f"    Name: {notif['full_name']}")
            print(f"    Student Number: {notif['stud_num']}")
            print(f"    Reason: {notif['reason']}")
            print(f"    Status: {notif['status']}")
            print(f"    Requested: {notif['requested_at']}")
            print()
        
        # Test counts
        cursor.execute("SELECT COUNT(*) as c FROM alumni_update_requests WHERE status = 'pending'")
        pending_count = cursor.fetchone()["c"]
        
        cursor.execute("SELECT COUNT(*) as c FROM alumni_update_requests WHERE status = 'approved'")
        approved_count = cursor.fetchone()["c"]
        
        cursor.execute("SELECT COUNT(*) as c FROM alumni_update_requests WHERE status = 'rejected'")
        rejected_count = cursor.fetchone()["c"]
        
        print(f"📈 Request Counts:")
        print(f"  - Pending: {pending_count}")
        print(f"  - Approved: {approved_count}")
        print(f"  - Rejected: {rejected_count}")
        
        if pending_count > 0:
            print("✅ SUCCESS: Requests appear in Admin Notifications!")
        else:
            print("❌ ISSUE: No pending requests found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    test_admin_notifications()
