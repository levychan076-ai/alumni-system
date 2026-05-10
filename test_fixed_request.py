#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db
from datetime import datetime

def test_fixed_request():
    """Test the fixed request update logic with real data"""
    
    print("=== TESTING FIXED REQUEST LOGIC ===")
    
    db = get_db()
    cursor = db.cursor()
    
    # Use the real alumni account email
    session_username = "levychan076@gmail.com"
    
    try:
        # Get alumni account info
        cursor.execute("SELECT * FROM alumni_account WHERE alumni_email = %s", (session_username,))
        alumni_account = cursor.fetchone()
        print(f"✅ Alumni account: {alumni_account}")

        if not alumni_account:
            print("❌ Account not found")
            return

        # Try to find corresponding alumni record in alumni_table
        cursor.execute("SELECT alumni_id FROM alumni_table WHERE email = %s LIMIT 1", (session_username,))
        alumni_record = cursor.fetchone()
        print(f"📊 Alumni record by email: {alumni_record}")
        
        # If not found by email, try by name
        if not alumni_record:
            cursor.execute("""
                SELECT alumni_id FROM alumni_table 
                WHERE last_name = %s AND first_name = %s 
                LIMIT 1
            """, (alumni_account['alumni_Lname'], alumni_account['alumni_Fname']))
            alumni_record = cursor.fetchone()
            print(f"📊 Alumni record by name: {alumni_record}")

        # If still not found, create a new alumni record from account data
        if not alumni_record:
            print(f"🔧 Creating new alumni record for {alumni_account['alumni_email']}")
            cursor.execute("""
                INSERT INTO alumni_table
                (stud_num, last_name, middle_name, first_name, address, email, contact_num, added_by, date_added)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                f"TAL-{datetime.now().year}-{str(alumni_account['Al_Account_id']).zfill(5)}",
                alumni_account['alumni_Lname'],
                alumni_account['alumni_Mname'] or '',
                alumni_account['alumni_Fname'],
                '',
                alumni_account['alumni_email'],
                '',
                'alumni_self_service',
                datetime.now().date()
            ))
            alumni_id = cursor.lastrowid
            print(f"✅ Created new alumni record with ID: {alumni_id}")
        else:
            alumni_id = alumni_record['alumni_id']
            print(f"✅ Found existing alumni record with ID: {alumni_id}")

        # Prevent duplicate pending requests
        cursor.execute(
            "SELECT id FROM alumni_update_requests WHERE alumni_id = %s AND status = 'pending'",
            (alumni_id,)
        )
        existing = cursor.fetchone()
        print(f"📊 Existing pending request: {existing}")

        if existing:
            print("⚠️  Already has pending request")
        else:
            # Insert new request
            cursor.execute("""
                INSERT INTO alumni_update_requests (alumni_id, reason, status, requested_at)
                VALUES (%s, %s, 'pending', %s)
            """, (alumni_id, "Test request from debug script", datetime.now()))

            db.commit()
            print("✅ Insert successful")
            
            # Verify insert
            cursor.execute("SELECT * FROM alumni_update_requests WHERE alumni_id = %s ORDER BY requested_at DESC LIMIT 1", (alumni_id,))
            inserted = cursor.fetchone()
            print(f"📊 Inserted record: {inserted}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    test_fixed_request()
