from app import get_db

db = get_db()
cursor = db.cursor()
cursor.execute('SHOW TABLES')
tables = [table[0] for table in cursor.fetchall()]
print("Tables in database:")
for table in tables:
    print(f"- {table}")

# Check if alumni_update_requests exists
if 'alumni_update_requests' in tables:
    print("\nAlumni update requests table structure:")
    cursor.execute('DESCRIBE alumni_update_requests')
    columns = cursor.fetchall()
    for col in columns:
        print(f"  {col[0]}: {col[1]} {col[2]} {col[3]} {col[4]} {col[5]}")
else:
    print("\nalumni_update_requests table does not exist")

cursor.close()
db.close()
