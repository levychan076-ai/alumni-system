import pymysql

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="alumni_system"
    )

def fix_exact_majors():
    """Fix database to have only EXACT required majors"""
    db = get_db()
    cursor = db.cursor()
    
    try:
        print("=== REMOVING ALL EXISTING MAJORS ===")
        cursor.execute("DELETE FROM majors")
        print("All majors deleted")
        
        print("\n=== ADDING EXACT REQUIRED MAJORS ===")
        
        # Get program IDs
        cursor.execute("SELECT program_id, program_name FROM programs")
        programs = {row[1]: row[0] for row in cursor.fetchall()}
        
        # BSIT majors
        bsit_majors = ['Web System Technology', 'Database System Technology']
        print(f"\nAdding BSIT majors:")
        for major_name in bsit_majors:
            cursor.execute("""
                INSERT INTO majors (major_name, program_id, created_by, date_created)
                VALUES (%s, %s, 'system', NOW())
            """, (major_name, programs['BSIT']))
            print(f"  Added: {major_name}")
        
        # BSBA majors  
        bsba_majors = ['Marketing Management']
        print(f"\nAdding BSBA majors:")
        for major_name in bsba_majors:
            cursor.execute("""
                INSERT INTO majors (major_name, program_id, created_by, date_created)
                VALUES (%s, %s, 'system', NOW())
            """, (major_name, programs['BSBA']))
            print(f"  Added: {major_name}")
        
        # BEED majors
        beed_majors = ['Basic Education']
        print(f"\nAdding BEED majors:")
        for major_name in beed_majors:
            cursor.execute("""
                INSERT INTO majors (major_name, program_id, created_by, date_created)
                VALUES (%s, %s, 'system', NOW())
            """, (major_name, programs['BEED']))
            print(f"  Added: {major_name}")
        
        db.commit()
        print("\n✅ Database updated with EXACT required majors only!")
        
        # Verify final state
        print("\n=== FINAL VERIFICATION ===")
        cursor.execute("""
            SELECT m.major_name, p.program_name 
            FROM majors m 
            JOIN programs p ON m.program_id = p.program_id 
            ORDER BY p.program_name, m.major_name
        """)
        
        final_majors = cursor.fetchall()
        for major in final_majors:
            print(f"{major[1]}: {major[0]}")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    fix_exact_majors()
