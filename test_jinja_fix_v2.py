def test_jinja_fix():
    """Test if Jinja now variable is properly passed"""
    
    print("=== TESTING JINJA FIX ===")
    
    try:
        # Test if template can be rendered with now variable
        from flask import Flask, render_template
        from datetime import datetime
        
        app = Flask(__name__)
        
        with app.app_context():
            # Test rendering with now variable
            now_dt = datetime.now()
            template = render_template(
                'my_profile.html',
                alumni={'has_record': True},
                educ=None,
                employ=None,
                error=None,
                success=None,
                can_edit=True,
                user_type="ALUMNI",
                now=now_dt
            )
            
            # Check if now variable is available in template
            if 'now' in str(template):
                print("✅ SUCCESS: 'now' variable is available in template")
            else:
                print("❌ FAILED: 'now' variable not found in template")
                
            # Check for undefined variable errors
            if "'now' is undefined" in str(template):
                print("❌ FAILED: 'now' is still undefined")
            else:
                print("✅ SUCCESS: No 'now' undefined errors found")
                
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_jinja_fix()
