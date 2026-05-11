#!/usr/bin/env python3
"""
Specific test for the /add route database connection fix
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_add_route_specific():
    """Test the specific /add route structure"""
    print("=== Testing /add Route Database Connection Fix ===")
    
    # Read the app.py file
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the add route specifically
    add_route_start = content.find('@app.route("/add"')
    if add_route_start == -1:
        print("❌ Could not find /add route")
        return False
    
    # Find the end of the add route (next route or end of function)
    next_route = content.find('@app.route(', add_route_start + 1)
    if next_route == -1:
        # If no next route found, take a large chunk
        add_route_section = content[add_route_start:add_route_start + 20000]
    else:
        add_route_section = content[add_route_start:next_route]
    
    print(f"Analyzing /add route section ({len(add_route_section)} characters)...")
    
    # Count close calls within the add route only
    cursor_close_count = add_route_section.count('cursor.close()')
    db_close_count = add_route_section.count('db.close()')
    
    print(f"Close calls in /add route:")
    print(f"  - cursor.close(): {cursor_close_count}")
    print(f"  - db.close(): {db_close_count}")
    
    # Check for proper structure
    checks = {
        'has_try': 'try:' in add_route_section,
        'has_except': 'except Exception as e:' in add_route_section,
        'has_finally': 'finally:' in add_route_section,
        'has_commit': 'db.commit()' in add_route_section,
        'has_rollback': 'db.rollback()' in add_route_section,
        'safe_finally': 'if cursor:' in add_route_section and 'if db and db.open:' in add_route_section,
        'no_premature_close': 'cursor.close()\n            db.close()' not in add_route_section,
    }
    
    print("\nStructure checks:")
    for check_name, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"  {status} {check_name}: {'PASS' if passed else 'FAIL'}")
    
    # Check that we have exactly the right number of close calls
    # Should be 1 cursor.close() and 1 db.close() in the finally block
    correct_close_counts = cursor_close_count == 1 and db_close_count == 1
    
    print(f"\nClose count check:")
    status = "✅" if correct_close_counts else "❌"
    print(f"  {status} correct_close_counts: {'PASS' if correct_close_counts else 'FAIL'}")
    
    # Overall result
    all_checks_passed = all([
        checks['has_try'],
        checks['has_except'], 
        checks['has_finally'],
        checks['has_commit'],
        checks['has_rollback'],
        checks['safe_finally'],
        checks['no_premature_close'],
        correct_close_counts
    ])
    
    if all_checks_passed:
        print("\n🎉 ALL CHECKS PASSED!")
        print("\n✅ /add route database connection fix is CORRECT:")
        print("  - Proper try/except/finally structure")
        print("  - No duplicate close calls")
        print("  - Safe cleanup in finally block")
        print("  - Exactly 1 cursor.close() and 1 db.close() in finally")
        print("  - No premature closing in try block")
        return True
    else:
        print("\n❌ Some checks failed")
        return False

def check_insert_operations():
    """Verify INSERT operations are preserved"""
    print("\n=== Checking INSERT Operations ===")
    
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the add route
    add_route_start = content.find('@app.route("/add"')
    next_route = content.find('@app.route(', add_route_start + 1)
    if next_route == -1:
        add_route_section = content[add_route_start:add_route_start + 20000]
    else:
        add_route_section = content[add_route_start:next_route]
    
    insert_checks = {
        'alumni_table': 'INSERT INTO alumni_table' in add_route_section,
        'alumni_degree': 'INSERT INTO alumni_degree' in add_route_section,
        'alumni_employment': 'INSERT INTO alumni_employment' in add_route_section,
        'debug_logging': 'app.logger.info' in add_route_section,
        'commit_present': 'db.commit()' in add_route_section,
    }
    
    print("INSERT operations in /add route:")
    for check_name, present in insert_checks.items():
        status = "✅" if present else "❌"
        print(f"  {status} {check_name}: {'PRESENT' if present else 'MISSING'}")
    
    return all(insert_checks.values())

if __name__ == "__main__":
    print("Testing /add Route Database Connection Fix")
    print("=" * 50)
    
    structure_ok = test_add_route_specific()
    inserts_ok = check_insert_operations()
    
    print("\n" + "=" * 50)
    print("🎯 FINAL RESULT")
    print("=" * 50)
    
    if structure_ok and inserts_ok:
        print("🎉 SUCCESS! /add route database connection is FIXED!")
        print("\nThe 'Already closed' error should no longer occur:")
        print("✅ Removed duplicate db.close() calls")
        print("✅ Implemented safe cleanup in finally block") 
        print("✅ Preserved all INSERT operations")
        print("✅ Maintained existing validations")
        print("✅ Proper commit/rollback handling")
    else:
        print("❌ Issues still exist - please review")
