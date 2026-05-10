#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db
from datetime import datetime

def debug_request_update():
    """Debug the request update process step by step"""
    
    print("=== DEBUGGING REQUEST UPDATE PROCESS ===")
    
    # Test database connection
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return
    
    # Test alumni_account query
    try:
        cursor.execute("SELECT * FROM alumni_account WHERE alumni_email = %s", ("test@example.com",))
        alumni_account = cursor.fetchone()
        print(f"📊 Alumni account query result: {alumni_account}")
    except Exception as e:
        print(f"❌ Alumni account query failed: {e}")
        return
    
    # Test alumni_table query
    try:
        cursor.execute("SELECT alumni_id FROM alumni_table WHERE email = %s LIMIT 1", ("test@example.com",))
        alumni_record = cursor.fetchone()
        print(f"📊 Alumni record query result: {alumni_record}")
    except Exception as e:
        print(f"❌ Alumni record query failed: {e}")
        return
    
    # Test duplicate check
    try:
        if alumni_record:
            cursor.execute("SELECT id FROM alumni_update_requests WHERE alumni_id = %s AND status = 'pending'", (alumni_record['alumni_id'],))
            existing = cursor.fetchone()
            print(f"📊 Existing pending request: {existing}")
    except Exception as e:
        print(f"❌ Duplicate check failed: {e}")
        return
    
    # Test insert
    try:
        if alumni_record and not existing:
            cursor.execute("""
                INSERT INTO alumni_update_requests (alumni_id, reason, status, requested_at)
                VALUES (%s, %s, 'pending', %s)
            """, (alumni_record['alumni_id'], "Debug test request", datetime.now()))
            db.commit()
            print("✅ Insert successful")
            
            # Verify insert
            cursor.execute("SELECT * FROM alumni_update_requests WHERE alumni_id = %s ORDER BY requested_at DESC LIMIT 1", (alumni_record['alumni_id'],))
            inserted = cursor.fetchone()
            print(f"📊 Inserted record: {inserted}")
    except Exception as e:
        print(f"❌ Insert failed: {e}")
        db.rollback()
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    debug_request_update()
