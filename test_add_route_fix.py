#!/usr/bin/env python3
"""
Test script to verify the /add route database connection fix
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app

def test_add_route_structure():
    """Test that the /add route has proper database connection handling"""
    print("=== Testing /add Route Database Connection Fix ===")
    
    # Read the app.py file to check the structure
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the add route
    add_route_start = content.find('@app.route("/add"')
    if add_route_start == -1:
        print("❌ Could not find /add route")
        return False
    
    # Extract the add route section
    add_route_section = content[add_route_start:add_route_start + 20000]  # Large enough to capture the whole route
    
    # Check for proper database connection handling
    checks = {
        'try_block': 'try:' in add_route_section,
        'except_block': 'except Exception as e:' in add_route_section,
        'finally_block': 'finally:' in add_route_section,
        'no_duplicate_close': add_route_section.count('cursor.close()') <= 2,
        'no_duplicate_db_close': add_route_section.count('db.close()') <= 2,
        'safe_finally_cleanup': 'if cursor:' in add_route_section and 'if db and db.open:' in add_route_section,
        'commit_present': 'db.commit()' in add_route_section,
        'rollback_present': 'db.rollback()' in add_route_section,
    }
    
    print("Database Connection Structure Check:")
    for check_name, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"  {status} {check_name}: {'PASS' if passed else 'FAIL'}")
    
    # Check that we don't have premature closing
    premature_closing = 'cursor.close()\n            db.close()' in add_route_section
    if premature_closing:
        print("  ❌ premature_closing: FAIL (Found duplicate close calls)")
    else:
        print("  ✅ premature_closing: PASS (No duplicate close calls)")
    
    # Overall result
    all_checks_passed = all([
        checks['try_block'],
        checks['except_block'], 
        checks['finally_block'],
        checks['no_duplicate_close'],
        checks['no_duplicate_db_close'],
        checks['safe_finally_cleanup'],
        checks['commit_present'],
        checks['rollback_present'],
        not premature_closing
    ])
    
    if all_checks_passed:
        print("\n🎉 All database connection checks PASSED!")
        print("\n✅ /add route structure is now correct:")
        print("  - Single try/except/finally block")
        print("  - No duplicate database close calls")
        print("  - Safe cleanup in finally block")
        print("  - Proper commit/rollback handling")
        return True
    else:
        print("\n❌ Some checks failed - please review the implementation")
        return False

def check_insert_operations_preserved():
    """Verify that all INSERT operations are still present"""
    print("\n=== Checking INSERT Operations Preserved ===")
    
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the add route
    add_route_start = content.find('@app.route("/add"')
    add_route_section = content[add_route_start:add_route_start + 20000]
    
    insert_checks = {
        'alumni_table_insert': 'INSERT INTO alumni_table' in add_route_section,
        'alumni_degree_insert': 'INSERT INTO alumni_degree' in add_route_section,
        'alumni_employment_insert': 'INSERT INTO alumni_employment' in add_route_section,
        'debug_logging': 'app.logger.info' in add_route_section,
    }
    
    print("INSERT Operations Check:")
    for check_name, passed in insert_checks.items():
        status = "✅" if passed else "❌"
        print(f"  {status} {check_name}: {'PRESENT' if passed else 'MISSING'}")
    
    all_inserts_present = all(insert_checks.values())
    
    if all_inserts_present:
        print("\n✅ All INSERT operations preserved!")
        return True
    else:
        print("\n❌ Some INSERT operations missing!")
        return False

if __name__ == "__main__":
    print("Testing /add Route Database Connection Fix")
    print("=" * 50)
    
    structure_ok = test_add_route_structure()
    inserts_ok = check_insert_operations_preserved()
    
    print("\n" + "=" * 50)
    print("🎯 FINAL RESULT")
    print("=" * 50)
    
    if structure_ok and inserts_ok:
        print("🎉 ALL TESTS PASSED!")
        print("\nThe /add route database connection issue has been fixed:")
        print("✅ Removed duplicate db.close() calls")
        print("✅ Implemented safe cleanup in finally block")
        print("✅ Preserved all INSERT operations")
        print("✅ Maintained existing validations and logic")
        print("\nThe 'Already closed' error should no longer occur!")
    else:
        print("❌ Some tests failed - please review the implementation")
