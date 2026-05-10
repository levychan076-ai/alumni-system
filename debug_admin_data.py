#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db

def debug_admin_notifications_data():
    """Debug the exact data being passed to alumni_notif.html"""
    
    print("=== DEBUGGING ADMIN NOTIFICATIONS DATA ===")
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        filter_status = "pending"
        
        if filter_status == "all":
            where = ""
            params = []
        else:
            where = "WHERE r.status = %s"
            params = [filter_status]

        # Execute the exact same query as the Flask route
        cursor.execute(f"""
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
            {where}
            ORDER BY r.requested_at DESC
        """, params)

        notifications = cursor.fetchall()
        
        print(f"📊 Notifications being passed to template: {len(notifications)}")
        
        for notif in notifications:
            print(f"\n--- Notification {notif['id']} ---")
            print(f"Full Name: '{notif['full_name']}'")
            print(f"Student Number: '{notif['stud_num']}'")
            print(f"Reason: '{notif['reason']}'")
            print(f"Status: '{notif['status']}'")
            print(f"Admin Note: '{notif['admin_note']}'")
            print(f"Requested At: {notif['requested_at']}")
            print(f"Resolved At: {notif['resolved_at']}")
            print(f"Resolved By: '{notif['resolved_by']}'")
            print(f"Photo: '{notif['photo']}'")
            
        # Test what the template would render
        print(f"\n🖥️  TEMPLATE RENDERING TEST:")
        for notif in notifications:
            print(f"Template would show: Reason: {notif['reason']}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    debug_admin_notifications_data()
