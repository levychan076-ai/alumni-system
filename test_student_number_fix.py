import re

def test_student_number_validation():
    """Test the new student number validation logic"""
    
    print("=== Testing Student Number Validation Fix ===\n")
    
    # Test cases: input -> expected result
    test_cases = [
        ("2023-00238", "TAL-2023-00238"),  # Normal case
        ("TAL-2023-00238", "TAL-2023-00238"),  # With prefix
        ("2024-12345", "TAL-2024-12345"),  # Different year
        ("TAL-2024-12345", "TAL-2024-12345"),  # With prefix
        ("2023-00238 ", "TAL-2023-00238"),  # With space
        (" TAL-2023-00238", "TAL-2023-00238"),  # With space and prefix
    ]
    
    invalid_cases = [
        "202300238",  # Missing dash
        "23-00238",   # Wrong year format
        "2023-0238",  # Wrong number format
        "2023-002389", # Too many digits
        "abc-defgh",  # Non-numeric
        "",           # Empty
    ]
    
    print("✓ Testing valid cases:")
    for input_val, expected in test_cases:
        # Simulate the validation logic
        clean_stud_num = input_val.replace("TAL-", "").replace(" ", "")
        if re.match(r"^\d{4}-\d{5}$", clean_stud_num):
            result = f"TAL-{clean_stud_num}"
            status = "✓" if result == expected else "✗"
            print(f"  {status} Input: '{input_val}' -> Output: '{result}'")
        else:
            print(f"  ✗ Input: '{input_val}' -> Validation failed (unexpected)")
    
    print("\n✗ Testing invalid cases:")
    for input_val in invalid_cases:
        clean_stud_num = input_val.replace("TAL-", "").replace(" ", "")
        if re.match(r"^\d{4}-\d{5}$", clean_stud_num):
            result = f"TAL-{clean_stud_num}"
            print(f"  ✗ Input: '{input_val}' -> Should be invalid but got: '{result}'")
        else:
            print(f"  ✓ Input: '{input_val}' -> Correctly rejected")
    
    print("\n=== Test completed ===")
    print("The validation logic should now accept YYYY-XXXXX format and auto-prepend TAL-")

if __name__ == "__main__":
    test_student_number_validation()
