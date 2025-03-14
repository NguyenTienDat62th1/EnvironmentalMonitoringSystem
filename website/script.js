document.addEventListener("DOMContentLoaded", function () {

    // Xử lý sự kiện đăng nhập
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("✅ Đăng nhập thành công!");
                localStorage.setItem("token", data.token); // Lưu token
                location.reload(); // Refresh trang
            } else {
                alert("❌ Sai tài khoản hoặc mật khẩu!");
            }
        })
        .catch(error => console.error("Lỗi khi đăng nhập:", error));
    });

    // Xử lý sự kiện đăng ký
    document.getElementById("registerForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("registerUsername").value;
        const password = document.getElementById("registerPassword").value;

        fetch("http://127.0.0.1:8000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("✅ Đăng ký thành công! Bạn có thể đăng nhập ngay.");
                document.getElementById("registerForm").reset();
                new bootstrap.Modal(document.getElementById("registerModal")).hide();
            } else {
                alert("❌ Đăng ký thất bại! " + data.message);
            }
        })
        .catch(error => console.error("Lỗi khi đăng ký:", error));
    });

    const sensorData = [
        { id: "temperature", icon: "fas fa-temperature-high", name: "Temperature", unit: "°C" },
        { id: "humidity", icon: "fas fa-tint", name: "Air Humidity", unit: "%" },
        { id: "soil_moisture", icon: "fas fa-water", name: "Soil Moisture", unit: "%" },
        { id: "pH", icon: "fas fa-flask", name: "Soil pH", unit: "" },
        { id: "light", icon: "fas fa-sun", name: "Light Intensity", unit: "lux" },
        { id: "CO2", icon: "fas fa-smog", name: "CO2 Level", unit: "ppm" },
        { id: "nutrients", icon: "fas fa-seedling", name: "Soil Nutrients", unit: "" },
        { id: "wind_speed", icon: "fas fa-wind", name: "Wind Speed", unit: "km/h" },
        { id: "wind_direction", icon: "fas fa-compass", name: "Wind Direction", unit: "°" },
        { id: "water_quality", icon: "fas fa-water", name: "Water Quality", unit: "TDS" }
    ];

    const container = document.getElementById("sensor-container");

    const charts = {};

    // Tạo thẻ card cảm biến
    sensorData.forEach(sensor => {
        const card = document.createElement("div");
        card.className = "col-md-3 mb-4";
        card.innerHTML = `
            <div class="card sensor-card">
                <div class="card-body">
                    <h5 class="card-title"><i class="${sensor.icon}"></i> ${sensor.name}</h5>
                    <h2 class="sensor-value" id="${sensor.id}">-- ${sensor.unit}</h2>
                    <canvas id="${sensor.id}Chart"></canvas>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Hàm tạo dữ liệu ngẫu nhiên cho biểu đồ
    function generateRandomData(min, max, length = 10) {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    // Tạo biểu đồ cho từng cảm biến
    sensorData.forEach(sensor => {
        const ctx = document.getElementById(`${sensor.id}Chart`).getContext("2d");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: Array.from({ length: 10 }, (_, i) => i + 1), // Nhãn từ 1 đến 10
                datasets: [{
                    label: sensor.name,
                    data: generateRandomData(sensor.min, sensor.max),
                    borderColor: "blue",
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        suggestedMin: sensor.min, // Giới hạn dưới
                        suggestedMax: sensor.max  // Giới hạn trên
                    }
                }
            }
        });
    });
    // Hàm lấy dữ liệu từ API
    function fetchData() {
        fetch("http://127.0.0.1:8000/sensors/latest_all")
            .then(response => response.json())
            .then(sensorValues => {
                console.log("📩 Dữ liệu nhận được:", sensorValues);

                for (let sensor in sensorValues) {
                    const element = document.getElementById(sensor);
                    if (element) {
                        const value = sensorValues[sensor].value;
                        const unit = getUnit(sensor);
                        element.innerHTML = `${value} ${unit}`;
                        updateChart(sensor, value);
                    }
                }
            })
            .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
    }

    setInterval(fetchData, 5000);

    // Hàm lấy đơn vị đo
    function getUnit(sensor) {
        const units = {
            "temperature": "°C",
            "humidity": "%",
            "soil_moisture": "%",
            "pH": "",
            "light": "lux",
            "CO2": "ppm",
            "nutrients": "",
            "wind_speed": "km/h",
            "wind_direction": "°",
            "water_quality": "TDS"
        };
        return units[sensor] || "";
    }
    // Cập nhật dữ liệu vào biểu đồ
    function updateChart(sensorId, newValue) {
        const chart = charts[sensorId];
        if (chart) {
            if (chart.data.labels.length >= 10) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            chart.data.labels.push(new Date().toLocaleTimeString());
            chart.data.datasets[0].data.push(newValue);
            chart.update();
        }
    }
});