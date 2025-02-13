from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db.mongodb import get_db
from bson import ObjectId

app = FastAPI()

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

@app.get("/sensors/latest")
def get_latest_sensor_data(sensor_type: str, limit: int = 10):
    db = get_db()
    collection = db["sensors_data"]

    # Lấy dữ liệu mới nhất của loại cảm biến cụ thể
    data = list(collection.find({"type": sensor_type}).sort("create_time", -1).limit(limit))

    # Chuyển đổi ObjectId thành string để có thể serialize
    formatted_data = []
    for item in data:
        item["_id"] = str(item["_id"])
        formatted_data.append(item)

    return formatted_data




# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from db.mongodb import get_db

# app = FastAPI()

# # Schema cho độ ẩm
# class HumidityData(BaseModel):
#     timestamp: str
#     humidity: float

# # Schema cho nhiệt độ
# class TemperatureData(BaseModel):
#     timestamp: str
#     temperature: float


# @app.post("/sensors/create")
# def post_humidity_data(data: dict):
#     db = get_db()
#     collection = db["sensors_data"]

#     humidity_entry = data
#     result = collection.insert_one(humidity_entry)

#     # if not result.inserted_id:
#     #     raise HTTPException(status_code=500, detail="Lỗi khi lưu dữ liệu vào MongoDB")

#     return {"message": "Data đã được lưu!"}

# # API POST nhận dữ liệu độ ẩm và lưu vào MongoDB
# @app.post("/humidity")
# def post_humidity_data(data: HumidityData):
#     db = get_db()
#     collection = db["humidity_data"]

#     humidity_entry = data.dict()
#     result = collection.insert_one(humidity_entry)

#     if not result.inserted_id:
#         raise HTTPException(status_code=500, detail="Lỗi khi lưu dữ liệu vào MongoDB")

#     return {"message": "Độ ẩm đã được lưu!", "data": humidity_entry}

# # API POST nhận dữ liệu nhiệt độ và lưu vào MongoDB
# @app.post("/temperature")
# def post_temperature_data(data: TemperatureData):
#     db = get_db()
#     collection = db["temperature_data"]

#     temperature_entry = data.dict()
#     result = collection.insert_one(temperature_entry)

#     if not result.inserted_id:
#         raise HTTPException(status_code=500, detail="Lỗi khi lưu dữ liệu vào MongoDB")

#     return {"message": "Nhiệt độ đã được lưu!", "data": temperature_entry}

# # API GET để lấy dữ liệu mới nhất
# @app.get("/humidity")
# def get_latest_humidity(limit: int = 10):
#     db = get_db()
#     collection = db["humidity_data"]
#     data = list(collection.find().sort("timestamp", -1).limit(limit))
#     for item in data:
#         item["_id"] = str(item["_id"])
#     return data

# @app.get("/temperature")
# def get_latest_temperature(limit: int = 10):
#     db = get_db()
#     collection = db["temperature_data"]
#     data = list(collection.find().sort("timestamp", -1).limit(limit))
#     for item in data:
#         item["_id"] = str(item["_id"])
#     return data

# # API GET để lấy dữ liệu mới nhất
# @app.get("/sensors/latest")
# def get_latest_sensor_data(limit: int = 10):
#     db = get_db()
#     collection = db["sensors_data"]
    
#     # Lấy dữ liệu mới nhất dựa trên timestamp, giới hạn số lượng bản ghi
#     data = list(collection.find().sort("timestamp", -1).limit(limit))
    
#     # Chuyển đổi ObjectId thành string để có thể serialize
#     for item in data:
#         item["_id"] = str(item["_id"])
    
#     return data
