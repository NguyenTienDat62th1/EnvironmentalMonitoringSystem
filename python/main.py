from fastapi import FastAPI
from db.mongodb import get_db

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hệ thống Giám sát Chất lượng Môi trường đang hoạt động!"}

@app.get("/humidity")
def get_humidity_data(limit: int = 10):
    db = get_db()
    collection = db["humidity_data"]
    data = list(collection.find().sort("timestamp", -1).limit(limit))
    for item in data:
        item["_id"] = str(item["_id"])  # Chuyển ObjectId thành string để JSON có thể xử lý
    return data
