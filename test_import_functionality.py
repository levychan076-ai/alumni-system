import pandas as pd
from app import normalize_column_name, validate_student_number, validate_email, validate_date, validate_import_data
import tempfile
import os

def test_normalize_column_name():
    """Test column name normalization"""
    print("Testing normalize_column_name...")
    
    # Test personal info mappings
    assert normalize_column_name("Student Number") == "stud_num"
    assert normalize_column_name("Last Name") == "last_name"
    assert normalize_column_name("First Name") == "first_name"
    assert normalize_column_name("Email Address") == "email"
    assert normalize_column_name("Contact Number") == "contact_num"
    
    # Test educational info mappings
    assert normalize_column_name("Program") == "program"
    assert normalize_column_name("Major") == "major"
    assert normalize_column_name("Graduation Date") == "graduation_date"
    
    # Test employment info mappings
    assert normalize_column_name("Employment Status") == "employment_status"
    assert normalize_column_name("Job Title") == "job_title"
    
    print("✅ normalize_column_name tests passed")

def test_validate_student_number():
    """Test student number validation"""
    print("Testing validate_student_number...")
    
    # Valid formats
    result, error = validate_student_number("2023-00238")
    assert result == "TAL-2023-00238"
    assert error is None
    
    result, error = validate_student_number("TAL-2023-00238")
    assert result == "TAL-2023-00238"
    assert error is None
    
    # Invalid formats
    result, error = validate_student_number("202300238")
    assert result is None
    assert "Invalid student number format" in error
    
    result, error = validate_student_number("")
    assert result is None
    assert "required" in error
    
    print("✅ validate_student_number tests passed")

def test_validate_email():
    """Test email validation"""
    print("Testing validate_email...")
    
    # Valid emails
    result, error = validate_email("test@example.com")
    assert result == "test@example.com"
    assert error is None
    
    result, error = validate_email("user.name@domain.co.uk")
    assert result == "user.name@domain.co.uk"
    assert error is None
    
    # Invalid emails
    result, error = validate_email("invalid-email")
    assert result is None
    assert "Invalid email format" in error
    
    result, error = validate_email("")
    assert result is None
    assert "required" in error
    
    print("✅ validate_email tests passed")

def test_validate_date():
    """Test date validation"""
    print("Testing validate_date...")
    
    # Valid dates
    result, error = validate_date("2023-05-15")
    assert result is not None
    assert error is None
    
    result, error = validate_date("05/15/2023")
    assert result is not None
    assert error is None
    
    # Invalid dates
    result, error = validate_date("invalid-date")
    assert result is None
    assert "Invalid date format" in error
    
    result, error = validate_date("")
    assert result is None
    assert error is None  # Empty date is allowed
    
    print("✅ validate_date tests passed")

def test_validate_import_data():
    """Test import data validation"""
    print("Testing validate_import_data...")
    
    # Create test data
    test_data = {
        'Student Number': ['2023-00238', '2023-00239'],
        'Last Name': ['Dela Cruz', 'Santos'],
        'First Name': ['Juan', 'Maria'],
        'Email': ['juan@example.com', 'maria@example.com'],
        'Program': ['BSIT', 'BSBA'],
        'Major': ['Web Development', 'Marketing'],
        'Graduation Date': ['2023-05-15', '2023-05-16']
    }
    
    df = pd.DataFrame(test_data)
    valid_records, errors, warnings = validate_import_data(df)
    
    assert len(valid_records) == 2
    assert len(errors) == 0
    assert valid_records[0]['stud_num'] == 'TAL-2023-00238'
    assert valid_records[0]['last_name'] == 'Dela Cruz'
    assert valid_records[0]['email'] == 'juan@example.com'
    
    print("✅ validate_import_data tests passed")

def test_missing_required_fields():
    """Test validation with missing required fields"""
    print("Testing missing required fields...")
    
    # Create test data with missing email
    test_data = {
        'Student Number': ['2023-00238'],
        'Last Name': ['Dela Cruz'],
        'First Name': ['Juan']
        # Missing Email
    }
    
    df = pd.DataFrame(test_data)
    valid_records, errors, warnings = validate_import_data(df)
    
    assert len(valid_records) == 0
    assert len(errors) > 0
    assert "Missing required columns" in errors[0]
    
    print("✅ Missing required fields test passed")

if __name__ == "__main__":
    print("Running import functionality tests...\n")
    
    try:
        test_normalize_column_name()
        test_validate_student_number()
        test_validate_email()
        test_validate_date()
        test_validate_import_data()
        test_missing_required_fields()
        
        print("\n🎉 All tests passed! Import functionality is working correctly.")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
