import pymysql

def check_actual_database_structure():
    """Check actual alumni_table structure and data"""
    
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor()
        
        print("=== ACTUAL alumni_table STRUCTURE ===")
        cursor.execute("DESCRIBE alumni_table")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  {col['Field']}: {col['Type']} {'NULL' if col['Null'] == 'YES' else 'NOT NULL'}")
        
        print("\n=== SAMPLE DATA WITH PHOTOS ===")
        cursor.execute("""
            SELECT alumni_id, stud_num, photo, last_name, first_name 
            FROM alumni_table 
            WHERE photo IS NOT NULL AND photo != '' 
            LIMIT 3
        """)
        alumni_with_photos = cursor.fetchall()
        
        if alumni_with_photos:
            for alumni in alumni_with_photos:
                print(f"  ID: {alumni['alumni_id']}")
                print(f"  Student No: {alumni['stud_num']}")
                print(f"  Photo: '{alumni['photo']}'")
                print(f"  Name: {alumni['last_name']}, {alumni['first_name']}")
                print()
        else:
            print("  No alumni with photos found")
        
        print("\n=== CHECK build_search_query FUNCTION ===")
        # Check if build_search_query includes photo column
        import inspect
        import app
        
        try:
            source = inspect.getsource(app.build_search_query)
            if 'photo' in source:
                print("  ✓ build_search_query includes 'photo' column")
            else:
                print("  ✗ build_search_query missing 'photo' column")
        except:
            print("  ? Could not check build_search_query function")
        
        cursor.close()
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_actual_database_structure()
