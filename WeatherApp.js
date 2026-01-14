const apiKey = "65a8972d4a315bac51b9bf97790bde91";
const doc = document;
const form = doc.getElementById("location-form");
const locationInput = doc.getElementById("location-input");
const geoBtn = doc.getElementById("geo-btn");
const errorEl = doc.getElementById("error-message");
const unitToggle = doc.getElementById("unit-toggle");
let units = "metric";
const currentSection = doc.getElementById("current-weather");
const hourlySection = doc.getElementById("hourly-forecast");
const weeklySection = doc.getElementById("weekly-forecast");

// unit toggle event
unitToggle.addEventListener("change", () => {
  units = unitToggle.checked ? "imperial" : "metric";
});
// form submit event
form.addEventListener("submit", e => {
  e.preventDefault();
  getWeatherByCity(locationInput.value.trim());
});
// geolocation button event
geoBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(
    pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Location blocked. Enable GPS.")
  );
};
// loads by city
async function getWeatherByCity(city) {
  try {
    const geo = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    ).then(r => r.json());

    if (!geo.length) return showError("City not found.");

    getWeatherByCoords(geo[0].lat, geo[0].lon);
  } catch {
    showError("Error fetching city.");
  }
}
// loads by coordinates/geoloaction
async function getWeatherByCoords(lat, lon) {
  try {
    errorEl.textContent = "";
    const current = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
    ).then(r => r.json());

    const forecast = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
    ).then(r => r.json());

    displayCurrent(current);
    displayHourly(forecast.list.slice(0, 8));
    displayWeekly(forecast.list);
    setBackground(current.weather[0].main.toLowerCase());

  } catch {
    showError("Unable to fetch weather.");
  }
}

// display current weather
function displayCurrent(data) {
  const section = doc.getElementById("current-weather");
  section.style.display = "block";
  doc.getElementById("city-name").textContent = data.name;
  doc.getElementById("forecast").textContent = data.weather[0].description;
  doc.getElementById("weather-icon").src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  doc.getElementById("high-temp").textContent =
    `High: ${Math.round(data.main.temp_max)}°`;
  doc.getElementById("low-temp").textContent =
    `Low: ${Math.round(data.main.temp_min)}°`;
  doc.getElementById("humidity").textContent = `${data.main.humidity}%`;
  doc.getElementById("wind-speed").textContent =
    `${Math.round(data.wind.speed)} ${units === "metric" ? "m/s" : "mph"}`;

}
// display hourly forecast
function displayHourly(list) {
  const section = doc.getElementById("hourly-forecast");
  const container = doc.getElementById("hourly-container");
  container.innerHTML = "";
  section.style.display = "block"; 
  list.forEach(e => {
    const hour = new Date(e.dt_txt).getHours();
    container.innerHTML +=
      `<div class="hour-box">
        ${hour}:00
        <img src="https://openweathermap.org/img/wn/${e.weather[0].icon}.png">
        ${Math.round(e.main.temp)}°
      </div>`;
  });
}
// display weekly forecast
function displayWeekly(list) {
  const days = {};
  list.forEach(e => {
    const d = new Date(e.dt_txt).toLocaleDateString("en-US", { weekday: "short" });
    days[d] ??= { hi: -999, lo: 999, icon: e.weather[0].icon };
    days[d].hi = Math.max(days[d].hi, e.main.temp_max);
    days[d].lo = Math.min(days[d].lo, e.main.temp_min);
  });
  const section = doc.getElementById("weekly-forecast");
  const container = doc.getElementById("weekly-container");
  container.innerHTML = "";
  section.style.display = "block";

Object.entries(days).slice(0,5).forEach(([d, v]) => {
    container.innerHTML +=
      `<div class="day-box">
        ${d}
        <img src="https://openweathermap.org/img/wn/${v.icon}.png">
        H:${Math.round(v.hi)}° L:${Math.round(v.lo)}°
      </div>`;
  });
}

// weather background effect
function setBackground(condition) {
  const bg = doc.getElementById("weather-background");
  bg.className = "";
  bg.innerHTML = "";

  condition = condition.toLowerCase();

  if (condition.includes("rain") || condition.includes("drizzle")) {
    createRain(80); 
  } else if (condition.includes("snow")) {
    createSnow(60);
  } else if (condition.includes("fog") || condition.includes("mist")) {
    bg.classList.add("fog");
  } else if (condition.includes("cloud")) {
    bg.classList.add("clouds");
  } else {
    bg.classList.add("sun");
  }
}
//  rain effect
function createRain(numDrops = 80) {
  const bg = doc.getElementById("weather-background");
  bg.innerHTML = ""; 
  bg.className = "rain";

  for (let i = 0; i < numDrops; i++) {
    const drop = doc.createElement("div");
    drop.classList.add("rain-drop");

    drop.style.left = Math.random() * window.innerWidth + "px";

    const duration = 0.5 + Math.random() * 0.5; 
    drop.style.animationDuration = duration + "s";
    drop.style.animationDelay = Math.random() * 2 + "s";
    bg.appendChild(drop);
  }
}

// snow effect
function createSnow(num = 60) {
  const bg = document.getElementById("weather-background");
  bg.innerHTML = "";
  bg.className = "snow";

  for (let i = 0; i < num; i++) {
    const flake = document.createElement("div");
    flake.classList.add("snowflake");

    const size = Math.random() * 4 + 2;
    flake.style.width = size + "px";
    flake.style.height = size + "px";

    flake.style.left = Math.random() * 100 + "vw";

    flake.style.animationDuration = 3 + Math.random() * 4 + "s";
    flake.style.animationDelay = Math.random() * 3 + "s";

    bg.appendChild(flake);
  }
}


// display error message
function showError(msg) {
  errorEl.textContent = msg;
}

