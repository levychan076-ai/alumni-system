#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db

def debug_real_alumni_data():
    """Check what real alumni data exists"""
    
    print("=== CHECKING REAL ALUMNI DATA ===")
    
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Check alumni_account table
    cursor.execute("SELECT Al_Account_id, alumni_email, alumni_Lname, alumni_Fname FROM alumni_account LIMIT 5")
    accounts = cursor.fetchall()
    print(f"📊 Alumni accounts found: {len(accounts)}")
    for acc in accounts:
        print(f"  - ID: {acc['Al_Account_id']}, Email: {acc['alumni_email']}, Name: {acc['alumni_Fname']} {acc['alumni_Lname']}")
    
    # Check alumni_table
    cursor.execute("SELECT alumni_id, email, last_name, first_name FROM alumni_table LIMIT 5")
    records = cursor.fetchall()
    print(f"📊 Alumni records found: {len(records)}")
    for rec in records:
        print(f"  - ID: {rec['alumni_id']}, Email: {rec['email']}, Name: {rec['first_name']} {rec['last_name']}")
    
    # Check existing update requests
    cursor.execute("SELECT * FROM alumni_update_requests ORDER BY requested_at DESC LIMIT 5")
    requests = cursor.fetchall()
    print(f"📊 Update requests found: {len(requests)}")
    for req in requests:
        print(f"  - ID: {req['id']}, Alumni ID: {req['alumni_id']}, Status: {req['status']}, Reason: {req['reason']}")
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    debug_real_alumni_data()
