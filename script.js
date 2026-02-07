// ===== MQTT SETTINGS =====
// port: MQTT 8003
const MQTT_BROKER_URL = "wss://broker.emqx.io:8083/mqtt";
const TOPIC = "ECG";

const options = {
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 2000,
};

// ===== UI ELEMENTS =====
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");

const firmwareUrlInput = document.getElementById("firmwareUrl");
const sendUrlBtn = document.getElementById("sendUrlBtn");

const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");
const btn3 = document.getElementById("btn3");
const btn4 = document.getElementById("btn4");
const btn5 = document.getElementById("btn5");

// ===== FIRMWARE LINKOVI (zameni sa svojim GitHub Release linkovima) =====
const FIRMWARES = {
  bolest1: "https://pavleblagojevic.github.io/esp32-biomed-firmware/wolf_parkinson_ota.ino.bin",
  bolest2: "https://pavleblagojevic.github.io/esp32-biomed-firmware/atrijalna_fibrilacija_ota.ino-1.bin",
  bolest3: "https://pavleblagojevic.github.io/esp32-biomed-firmware/bigeminija_ota.ino.bin",
  bolest4: "https://pavleblagojevic.github.io/esp32-biomed-firmware/supraventrikularna_tahikardija_ota.ino.bin",
  bolest5: "https://pavleblagojevic.github.io/esp32-biomed-firmware/vantrikualarni_fibrilacija_ota.ino.bin",
};

// ===== LOG HELPER =====
function addLog(message) {
  const time = new Date().toLocaleTimeString();
  logEl.textContent += `[${time}] ${message}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

// ===== MQTT CONNECT =====
addLog("Povezivanje na MQTT broker...");
const client = mqtt.connect(MQTT_BROKER_URL, options);

client.on("connect", () => {
  statusEl.textContent = "Povezan ✅";
  statusEl.style.color = "#22c55e";
  addLog("Povezan na broker.emqx.io preko WebSocket-a");

  client.subscribe(TOPIC, (err) => {
    if (!err) addLog(`Pretplaćen na topic: ${TOPIC}`);
  });
});

client.on("message", (topic, message) => {
  addLog(`Primljeno -> Topic: "${topic}" | Payload: "${message.toString()}"`);
});

client.on("reconnect", () => {
  statusEl.textContent = "Pokušaj ponovnog povezivanja...";
  statusEl.style.color = "#f59e0b";
  addLog("Reconnecting...");
});

client.on("error", (err) => {
  statusEl.textContent = "Greška ❌";
  statusEl.style.color = "#ef4444";
  addLog("MQTT error: " + err.message);
});

client.on("close", () => {
  statusEl.textContent = "Diskonektovan ⚠️";
  statusEl.style.color = "#94a3b8";
  addLog("Veza zatvorena.");
});

// ===== SEND OTA URL =====
function sendFirmwareUrl(url) {
  if (!client.connected) {
    addLog("Nije povezano! Ne mogu da pošaljem.");
    return;
  }

  url = url.trim();
  if (!(url.startsWith("http://") || url.startsWith("https://"))) {
    addLog("❌ URL nije validan. Mora početi sa http:// ili https://");
    return;
  }

  client.publish(TOPIC, url, { qos: 0, retain: false });
  addLog(`✅ Poslat OTA URL na topic "${TOPIC}": ${url}`);
}

// ===== EVENTS =====
// Custom input
sendUrlBtn.addEventListener("click", () => {
  sendFirmwareUrl(firmwareUrlInput.value);
});
firmwareUrlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendFirmwareUrl(firmwareUrlInput.value);
});

// 5 dugmadi
btn1.addEventListener("click", () => sendFirmwareUrl(FIRMWARES.bolest1));
btn2.addEventListener("click", () => sendFirmwareUrl(FIRMWARES.bolest2));
btn3.addEventListener("click", () => sendFirmwareUrl(FIRMWARES.bolest3));
btn4.addEventListener("click", () => sendFirmwareUrl(FIRMWARES.bolest4));
btn5.addEventListener("click", () => sendFirmwareUrl(FIRMWARES.bolest5));
