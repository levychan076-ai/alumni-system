#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db
from datetime import datetime

def create_test_request():
    """Create a test pending request for AJAX testing"""
    
    print("=== CREATING TEST REQUEST ===")
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Reset the existing request to pending
        cursor.execute("UPDATE alumni_update_requests SET status = 'pending', admin_note = NULL, resolved_at = NULL, resolved_by = NULL WHERE id = 1")
        db.commit()
        
        # Verify it's pending
        cursor.execute("SELECT * FROM alumni_update_requests WHERE id = 1")
        request = cursor.fetchone()
        
        print(f"📊 Test request created:")
        print(f"   ID: {request['id']}")
        print(f"   Alumni ID: {request['alumni_id']}")
        print(f"   Reason: {request['reason']}")
        print(f"   Status: {request['status']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    create_test_request()
