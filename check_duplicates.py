import pymysql

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="alumni_system"
    )

def check_duplicate_majors():
    """Check for duplicate majors in database"""
    db = get_db()
    cursor = db.cursor()
    
    print("=== CHECKING FOR DUPLICATE MAJORS ===")
    
    # Check for duplicates in majors table
    cursor.execute("""
        SELECT m.major_name, p.program_name, COUNT(*) as count
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        GROUP BY m.major_name, p.program_name
        HAVING COUNT(*) > 1
        ORDER BY p.program_name, m.major_name
    """)
    
    duplicates = cursor.fetchall()
    
    if duplicates:
        print("DUPLICATES FOUND:")
        for dup in duplicates:
            print(f"  {dup['program_name']}: {dup['major_name']} (appears {dup['count']} times)")
    else:
        print("✅ NO DUPLICATES FOUND IN DATABASE")
    
    # Show all current majors for verification
    print("\n=== ALL CURRENT MAJORS ===")
    cursor.execute("""
        SELECT m.major_name, p.program_name 
        FROM majors m 
        JOIN programs p ON m.program_id = p.program_id 
        ORDER BY p.program_name, m.major_name
    """)
    
    all_majors = cursor.fetchall()
    for major in all_majors:
        print(f"  {major['program_name']}: {major['major_name']}")
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    check_duplicate_majors()
