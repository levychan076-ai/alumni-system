import mysql.connector

def check_update_requests_schema():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor(dictionary=True)
        
        # Check alumni_update_requests table structure
        cursor.execute("DESCRIBE alumni_update_requests")
        columns = cursor.fetchall()
        print("=== alumni_update_requests schema ===")
        for col in columns:
            print(f"{col['Field']}: {col['Type']} {col['Null']} {col['Key']}")
        
        # Check sample data
        cursor.execute("SELECT * FROM alumni_update_requests LIMIT 3")
        sample_data = cursor.fetchall()
        print(f"\n=== Sample update request data ===")
        for row in sample_data:
            print(f"ID: {row.get('id', 'N/A')}, Alumni ID: {row.get('alumni_id', 'N/A')}, Status: {row.get('status', 'N/A')}")
        
        cursor.close()
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_update_requests_schema()
