from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db.mongodb import get_db

app = FastAPI()

# Schema cho độ ẩm
class HumidityData(BaseModel):
    timestamp: str
    humidity: float

# Schema cho nhiệt độ
class TemperatureData(BaseModel):
    timestamp: str
    temperature: float

# API POST nhận dữ liệu độ ẩm và lưu vào MongoDB
@app.post("/humidity")
def post_humidity_data(data: HumidityData):
    db = get_db()
    collection = db["humidity_data"]

    humidity_entry = data.dict()
    result = collection.insert_one(humidity_entry)

    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Lỗi khi lưu dữ liệu vào MongoDB")

    return {"message": "Độ ẩm đã được lưu!", "data": humidity_entry}

# API POST nhận dữ liệu nhiệt độ và lưu vào MongoDB
@app.post("/temperature")
def post_temperature_data(data: TemperatureData):
    db = get_db()
    collection = db["temperature_data"]

    temperature_entry = data.dict()
    result = collection.insert_one(temperature_entry)

    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Lỗi khi lưu dữ liệu vào MongoDB")

    return {"message": "Nhiệt độ đã được lưu!", "data": temperature_entry}

# API GET để lấy dữ liệu mới nhất
@app.get("/humidity")
def get_latest_humidity(limit: int = 10):
    db = get_db()
    collection = db["humidity_data"]
    data = list(collection.find().sort("timestamp", -1).limit(limit))
    for item in data:
        item["_id"] = str(item["_id"])
    return data

@app.get("/temperature")
def get_latest_temperature(limit: int = 10):
    db = get_db()
    collection = db["temperature_data"]
    data = list(collection.find().sort("timestamp", -1).limit(limit))
    for item in data:
        item["_id"] = str(item["_id"])
    return data
