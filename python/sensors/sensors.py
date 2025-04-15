import random
import sched
import time
import requests

# Lập lịch chạy
scheduler = sched.scheduler(time.time, time.sleep)

# Giới hạn giá trị cho từng loại cảm biến
def get_sensor_ranges():
    return {
        "humidity": (40.0, 80.0),
        "temperature": (15.0, 40.0),
        "soil_moisture": (20.0, 60.0),
        "pH": (5.5, 8.5),
        "light": (0, 100000),  # Lux
        "CO2": (300, 800),  # ppm
        "nutrients": (10, 50),  # mg/L
        "wind_speed": (0, 20),  # m/s
        "wind_direction": (0, 360),  # Degrees
        "water_quality": (50, 150),  # TDS mg/L
    }

# Tạo biến lưu giá trị hiện tại
sensor_values = {sensor: round(random.uniform(*get_sensor_ranges()[sensor]), 2) for sensor in get_sensor_ranges()}

# Hàm gửi dữ liệu chung
def send_sensor_data(sensor_type):
    global sensor_values
    sensor_ranges = get_sensor_ranges()

    # Tạo sự thay đổi nhỏ ngẫu nhiên (-1.5% đến +1.5%)
    delta = random.uniform(-1.5, 1.5)
    new_value = max(sensor_ranges[sensor_type][0], min(sensor_values[sensor_type] + delta, sensor_ranges[sensor_type][1]))
    sensor_values[sensor_type] = round(new_value, 2)

    # Lấy thời gian hiện tại
    current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    # Gửi dữ liệu đến FastAPI
    data = {"create_time": current_time, "value": sensor_values[sensor_type], "type": sensor_type}
    response = requests.post("http://127.0.0.1:8000/sensors/create", json=data)

    print(f"[{current_time}] Send {sensor_type}: {sensor_values[sensor_type]}, Trạng thái: {response.status_code}")

    # Lên lịch chạy lại sau 15 phút
    scheduler.enter(15 , 1, send_sensor_data, argument=(sensor_type,))

# Tạo từng function riêng cho từng cảm biến
def send_humidity():
    send_sensor_data("humidity")

def send_temperature():
    send_sensor_data("temperature")

def send_soil_moisture():
    send_sensor_data("soil_moisture")

def send_pH():
    send_sensor_data("pH")

def send_light():
    send_sensor_data("light")

def send_CO2():
    send_sensor_data("CO2")

def send_nutrients():
    send_sensor_data("nutrients")

def send_wind_speed():
    send_sensor_data("wind_speed")

def send_wind_direction():
    send_sensor_data("wind_direction")

def send_water_quality():
    send_sensor_data("water_quality")

# Lên lịch cho từng cảm biến
scheduler.enter(0, 1, send_humidity)
scheduler.enter(0, 1, send_temperature)
scheduler.enter(0, 1, send_soil_moisture)
scheduler.enter(0, 1, send_pH)
scheduler.enter(0, 1, send_light)
scheduler.enter(0, 1, send_CO2)
scheduler.enter(0, 1, send_nutrients)
scheduler.enter(0, 1, send_wind_speed)
scheduler.enter(0, 1, send_wind_direction)
scheduler.enter(0, 1, send_water_quality)

scheduler.run()
