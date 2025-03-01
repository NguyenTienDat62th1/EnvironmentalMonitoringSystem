document.addEventListener("DOMContentLoaded", function () {
    const sensorData = [
        { id: "temperature", icon: "fas fa-temperature-high", name: "Temperature", unit: "°C", min: 10, max: 50 },
        { id: "airHumidity", icon: "fas fa-tint", name: "Air Humidity", unit: "%", min: 20, max: 100 },
        { id: "soilMoisture", icon: "fas fa-water", name: "Soil Moisture", unit: "%", min: 10, max: 90 },
        { id: "soilPH", icon: "fas fa-flask", name: "Soil pH", unit: "", min: 5, max: 8 },
        { id: "light", icon: "fas fa-sun", name: "Light Intensity", unit: "lux", min: 100, max: 1500 },
        { id: "co2", icon: "fas fa-smog", name: "CO2 Level", unit: "ppm", min: 300, max: 1000 },
        { id: "nutrients", icon: "fas fa-seedling", name: "Soil Nutrients", unit: "", min: 0, max: 100 },
        { id: "wind", icon: "fas fa-wind", name: "Wind", unit: "km/h", min: 0, max: 50 }
    ];

    const container = document.getElementById("sensor-container");

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
});
