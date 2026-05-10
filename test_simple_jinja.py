def test_simple_jinja():
    """Simple test of Jinja template rendering"""
    
    print("=== TESTING SIMPLE JINJA ===")
    
    try:
        from jinja2 import Environment, FileSystemLoader
        
        # Create Jinja environment with Flask-like functions
        def url_for(endpoint, filename=''):
            return f'/static/{filename}'
        
        env = Environment(loader=FileSystemLoader('templates'))
        template = env.get_template('my_profile.html')
        
        # Test rendering with now variable
        from datetime import datetime
        context = {
            'alumni': {'has_record': True},
            'educ': None,
            'employ': None,
            'error': None,
            'success': None,
            'can_edit': True,
            'user_type': 'ALUMNI',
            'now': datetime.now()
        }
        
        rendered = template.render(context)
        
        # Check if now variable is available in template
        if 'now' in rendered:
            print("✅ SUCCESS: 'now' variable is available in template")
        else:
            print("❌ FAILED: 'now' variable not found in template")
            
        # Check for undefined variable errors
        if "'now' is undefined" in rendered:
            print("❌ FAILED: 'now' is still undefined")
        else:
            print("✅ SUCCESS: No 'now' undefined errors found")
                
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_simple_jinja()
