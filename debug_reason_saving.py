#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db

def debug_reason_saving():
    """Debug how reasons are being saved in the database"""
    
    print("=== DEBUGGING REASON SAVING ===")
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Check current update requests
        cursor.execute("SELECT * FROM alumni_update_requests ORDER BY requested_at DESC")
        requests = cursor.fetchall()
        
        print(f"📊 Total requests found: {len(requests)}")
        
        for req in requests:
            print(f"\n--- Request ID: {req['id']} ---")
            print(f"Alumni ID: {req['alumni_id']}")
            print(f"Reason: '{req['reason']}'")
            print(f"Status: {req['status']}")
            print(f"Update Data: {req['update_data']}")
            print(f"Requested At: {req['requested_at']}")
            
        # Check if reason column exists and has data
        cursor.execute("DESCRIBE alumni_update_requests")
        columns = cursor.fetchall()
        
        print(f"\n📋 Table structure:")
        for col in columns:
            print(f"  {col['Field']}: {col['Type']} {col['Null']} {col['Default']}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    debug_reason_saving()
