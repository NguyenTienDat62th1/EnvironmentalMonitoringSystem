from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db.mongodb import get_db
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

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


# Lấy dữ liệu cảm biến nhiệt độ trong ngày hôm nay theo các mốc thời gian
@app.get("/sensors/temperature/today")
async def get_temperature_data():
    db = get_db()
    collection = db["sensors_data"]

    # Lấy ngày hôm nay
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Khởi tạo dữ liệu cho các mốc thời gian
    hourly_data = {f"{hour:02d}:00": None for hour in range(0, 24, 2)}
    
    # Lấy dữ liệu của ngày hôm nay
    data = collection.find({
        "type": "temperature",
        "create_time": {"$regex": f"^{today}"}
    }, {"_id": 0}).sort("create_time", 1)
    
    # Xử lý dữ liệu theo từng mốc thời gian
    for record in data:
        hour = int(record["create_time"].split(":")[0].split(" ")[1])
        # Làm tròn xuống số chẵn gần nhất
        rounded_hour = (hour // 2) * 2
        time_key = f"{rounded_hour:02d}:00"
        if time_key in hourly_data:
            hourly_data[time_key] = record["value"]
    
    # Chuyển đổi sang định dạng phù hợp cho biểu đồ
    formatted_data = [
        {"time": time, "value": value if value is not None else 0}
        for time, value in hourly_data.items()
    ]

    return {"data": formatted_data}

