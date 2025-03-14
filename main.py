from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db.mongodb import get_db
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Chấp nhận tất cả nguồn (có thể thay bằng ["http://127.0.0.1:5500"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Schema chung cho cảm biến
class SensorData(BaseModel):
    create_time: str
    value: float
    type: str  # humidity, temperature, soil_moisture, pH, light, CO2, nutrients, wind_speed, wind_direction, water_quality

@app.post("/sensors/create")
def post_sensor_data(data: SensorData):
    db = get_db()
    collection = db["sensors_data"]

    sensor_entry = data.dict()
    result = collection.insert_one(sensor_entry)

    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Lỗi khi lưu dữ liệu vào MongoDB")

    # Chuyển đổi ObjectId thành string trước khi trả về
    sensor_entry["_id"] = str(result.inserted_id)

    return {"message": f"{data.type} đã được lưu!", "data": sensor_entry}

@app.get("/sensors/latest_all")
def get_latest_all_sensors():
    db = get_db()
    collection = db["sensors_data"]

    latest_data = {}
    for sensor_type in ["temperature", "humidity", "soil_moisture", "pH", "light", "CO2", "nutrients", "wind_speed", "wind_direction", "water_quality"]:
        data = collection.find_one({"type": sensor_type}, sort=[("create_time", -1)])
        if data:
            latest_data[sensor_type] = {
                "value": data["value"],
                "create_time": data["create_time"]
            }

    return latest_data