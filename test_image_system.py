import mysql.connector
import os

def test_image_system():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor(dictionary=True)
        
        # Check existing photo data
        cursor.execute("SELECT alumni_id, photo FROM alumni_table WHERE photo IS NOT NULL AND photo != '' LIMIT 5")
        alumni_with_photos = cursor.fetchall()
        
        print("=== Alumni with photos ===")
        for alumni in alumni_with_photos:
            print(f"ID: {alumni['alumni_id']}, Photo: {alumni['photo']}")
            
            # Check if file exists
            if alumni['photo']:
                photo_path = os.path.join("static", "uploads", alumni['photo'])
                if os.path.exists(photo_path):
                    print(f"  ✓ File exists: {photo_path}")
                    print(f"  ✓ File size: {os.path.getsize(photo_path)} bytes")
                else:
                    print(f"  ✗ File missing: {photo_path}")
        
        # Check uploads folder
        uploads_dir = "static/uploads"
        if os.path.exists(uploads_dir):
            files = os.listdir(uploads_dir)
            print(f"\n=== Files in uploads folder ===")
            for file in files:
                file_path = os.path.join(uploads_dir, file)
                print(f"  {file} ({os.path.getsize(file_path)} bytes)")
        else:
            print(f"\n✗ Uploads folder does not exist: {uploads_dir}")
        
        cursor.close()
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_image_system()
