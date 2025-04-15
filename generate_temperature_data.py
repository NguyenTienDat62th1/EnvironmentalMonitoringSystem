import random
import datetime
from db.mongodb import get_db
from main import SensorData
import time

def generate_temperature_data():
    db = get_db()
    collection = db["sensors_data"]
    
    # Tạo dữ liệu cho 1 tuần trước
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=7)
    
    # Tạo dữ liệu với tần suất 15 phút
    current_time = start_date
    while current_time <= end_date:
        # Tạo giá trị nhiệt độ ngẫu nhiên (20-35 độ C)
        temperature = round(random.uniform(20, 35), 1)
        
        # Định dạng thời gian
        create_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
        
        # Tạo dữ liệu
        data = SensorData(
            create_time=create_time,
            value=temperature,
            type="temperature"
        )
        
        # Lưu vào MongoDB
        sensor_entry = data.dict()
        collection.insert_one(sensor_entry)
        
        # In thông tin
        print(f"Created data at {create_time}: {temperature}°C")
        
        # Tăng thời gian lên 15 phút
        current_time += datetime.timedelta(minutes=15)
        
        # Chờ 1 giây giữa các lần tạo dữ liệu
        time.sleep(1)

if __name__ == "__main__":
    print("Starting to generate temperature data...")
    generate_temperature_data()
    print("Data generation completed!")