import pymysql

def check_alumni_degree_schema():
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="alumni_system"
        )
        cursor = db.cursor()
        
        # Check alumni_degree table structure
        cursor.execute("DESCRIBE alumni_degree")
        columns = cursor.fetchall()
        print("=== alumni_degree schema ===")
        for col in columns:
            print(f"{col['Field']}: {col['Type']} {col['Null']} {col['Key']}")
        
        cursor.close()
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_alumni_degree_schema()
