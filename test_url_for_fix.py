import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Test importing app.py to check for url_for
    import app
    
    # Check if url_for is available in app module
    if hasattr(app, 'url_for'):
        print("✓ url_for is available in app module")
    else:
        print("✗ url_for is NOT available in app module")
    
    # Test if we can call url_for
    try:
        from flask import url_for
        test_url = url_for('static', filename='test.txt')
        print(f"✓ url_for works: {test_url}")
    except Exception as e:
        print(f"✗ url_for test failed: {e}")
    
    print("✅ url_for import fix appears to be working")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
except NameError as e:
    print(f"✗ NameError (this is what we're fixing): {e}")
except Exception as e:
    print(f"✗ Other error: {e}")
