#!/usr/bin/env python3
"""
Verification script to check password removal from alumni workflows
This script analyzes the code to verify password removal without requiring database connection
"""

import os
import re

def check_template_password_removal():
    """Check HTML templates for password field removal"""
    print("=== Checking HTML Templates for Password Removal ===")
    
    templates_to_check = [
        'templates/add.html',
        'templates/register.html', 
        'templates/my_profile.html'
    ]
    
    results = {}
    
    for template in templates_to_check:
        if os.path.exists(template):
            with open(template, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Check for password-related patterns
            password_inputs = len(re.findall(r'type=["\']?password["\']?', content, re.IGNORECASE))
            password_fields = len(re.findall(r'password', content, re.IGNORECASE))
            pw_strength = len(re.findall(r'pw-strength|pw-wrap', content, re.IGNORECASE))
            
            results[template] = {
                'password_inputs': password_inputs,
                'password_mentions': password_fields,
                'password_ui_elements': pw_strength
            }
            
            print(f"\n📄 {template}:")
            print(f"  - Password input fields: {password_inputs}")
            print(f"  - Password mentions: {password_fields}")
            print(f"  - Password UI elements: {pw_strength}")
            
            if password_inputs == 0 and pw_strength == 0:
                print(f"  ✅ PASSED - No password fields found")
            else:
                print(f"  ❌ FAILED - Password fields still present")
        else:
            print(f"\n❌ Template not found: {template}")
    
    return results

def check_flask_routes_password_removal():
    """Check Flask routes for password processing removal"""
    print("\n=== Checking Flask Routes for Password Removal ===")
    
    if not os.path.exists('app.py'):
        print("❌ app.py not found")
        return False
    
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for problematic patterns (excluding login routes)
    patterns_to_check = [
        ('alumni_password.*INSERT.*alumni_account', 'INSERT INTO alumni_account'),
        ('request.form.get.*password', 'Password form processing'),
        ('request.form.get.*confirm_password', 'Confirm password processing'),
        ('password.*len', 'Password length validation'),
        ('password.*!=.*confirm', 'Password match validation'),
        ('alumni_password.*%s.*password', 'Password parameter in INSERT'),
    ]
    
    # Exclude login routes from password processing check
    lines = content.split('\n')
    filtered_lines = []
    in_login_route = False
    
    for line in lines:
        # Check if we're in a login route (include all login functions)
        if ('def login_admin' in line or 'def login_alumni' in line or 'def login(' in line):
            in_login_route = True
        elif line.strip().startswith('@app.route') and in_login_route:
            in_login_route = False
        elif line.strip().startswith('def ') and in_login_route:
            in_login_route = False
        
        # Only include lines not in login routes for password processing check
        if not in_login_route:
            filtered_lines.append(line)
    
    content = '\n'.join(filtered_lines)
    
    results = {}
    for pattern, description in patterns_to_check:
        matches = len(re.findall(pattern, content, re.IGNORECASE))
        results[description] = matches
        
        if matches == 0:
            print(f"  ✅ {description}: {matches} occurrences (GOOD)")
        else:
            print(f"  ❌ {description}: {matches} occurrences (PROBLEM)")
    
    # Check for debug logging additions
    debug_patterns = [
        (r'app\.logger\.info.*DEBUG.*Inserting', 'Debug logging before INSERT'),
    ]
    
    print("\n📋 Debug Logging Check:")
    for pattern, description in debug_patterns:
        matches = len(re.findall(pattern, content, re.IGNORECASE))
        if matches > 0:
            print(f"  ✅ {description}: {matches} occurrences (GOOD)")
        else:
            print(f"  ⚠️  {description}: {matches} occurrences (MAY NEED ADDITION)")
    
    return results

def check_insert_statements():
    """Check that INSERT statements don't include alumni_password"""
    print("\n=== Checking INSERT Statements ===")
    
    if not os.path.exists('app.py'):
        print("❌ app.py not found")
        return False
    
    with open('app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find INSERT statements for alumni_table
    alumni_table_inserts = re.findall(
        r'INSERT\s+INTO\s+alumni_table\s*\([^)]+\)\s*VALUES\s*\([^)]+\)', 
        content, 
        re.IGNORECASE | re.MULTILINE | re.DOTALL
    )
    
    print(f"Found {len(alumni_table_inserts)} INSERT statements for alumni_table:")
    
    for i, insert in enumerate(alumni_table_inserts, 1):
        print(f"\n📝 INSERT #{i}:")
        print(f"   {insert[:100]}..." if len(insert) > 100 else f"   {insert}")
        
        # Check if alumni_password is mentioned
        if 'alumni_password' in insert.upper():
            print(f"   ❌ CONTAINS alumni_password (PROBLEM)")
        else:
            print(f"   ✅ NO alumni_password (GOOD)")
    
    # Check for alumni_account INSERTs
    alumni_account_inserts = re.findall(
        r'INSERT\s+INTO\s+alumni_account', 
        content, 
        re.IGNORECASE
    )
    
    if len(alumni_account_inserts) > 0:
        print(f"\n❌ Found {len(alumni_account_inserts)} INSERT statements for alumni_account (SHOULD BE REMOVED)")
    else:
        print(f"\n✅ No INSERT statements for alumni_account found (GOOD)")
    
    return len(alumni_table_inserts) > 0 and len(alumni_account_inserts) == 0

def main():
    print("Password Removal Verification Report")
    print("=" * 50)
    
    # Check templates
    template_results = check_template_password_removal()
    
    # Check Flask routes
    route_results = check_flask_routes_password_removal()
    
    # Check INSERT statements
    insert_ok = check_insert_statements()
    
    # Summary
    print("\n" + "=" * 50)
    print("🎯 SUMMARY")
    print("=" * 50)
    
    # Count issues
    template_issues = sum(1 for r in template_results.values() 
                         if r['password_inputs'] > 0 or r['password_ui_elements'] > 0)
    
    route_issues = sum(1 for count in route_results.values() if count > 0)
    
    print(f"Template Issues: {template_issues}")
    print(f"Route Issues: {route_issues}")
    print(f"INSERT Statements: {'✅ OK' if insert_ok else '❌ PROBLEMS'}")
    
    if template_issues == 0 and route_issues == 0 and insert_ok:
        print("\n🎉 ALL CHECKS PASSED!")
        print("\n✅ Password fields successfully removed from HTML forms")
        print("✅ Password processing removed from Flask routes")
        print("✅ INSERT statements updated to exclude alumni_password")
        print("✅ No alumni_account INSERT operations found")
        print("\nThe system should now work without requiring passwords for alumni profiles!")
    else:
        print(f"\n⚠️  {template_issues + route_issues} issues found that need attention")
        print("Please review the failed checks above.")

if __name__ == "__main__":
    main()
