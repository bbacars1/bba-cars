require("dotenv").config();
const express = require("express");
const cors = require("cors");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("BBA CARS backend ishlayapti!");
});
app.post("/order", async (req, res) => {
    console.log("🔥 /order ISHLADI!");
    const { car, name, phone } = req.body;

    console.log("Yangi ariza:");
    console.log("Avtomobil:", car);
    console.log("Ism:", name);
    console.log("Telefon:", phone);
    const now = new Date();
    const orderId = "BBA-" + Date.now().toString().slice(-6);

const time = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
}).format(now);

console.log("Ariza vaqti:", time);

const text = `
🚘 YANGI ARIZA — BBA CARS
🆔 Ariza №: ${orderId}
🚗 Avtomobil: ${car}
👤 Mijoz: ${name}
📞 Telefon: ${phone}
🕐 Ariza vaqti: ${time}
`;

const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text
    })
});
const telegramData = await telegramResponse.json();
console.log("Telegram javobi:", telegramData);
    res.json({
        success: true,
        message: "Ariza qabul qilindi"
    });
});
const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log(`BBA CARS server ishladi: http://localhost:${PORT}`);
});

server.on("close", () => {
    console.log("❌ SERVER YOPILDI!");
});
setInterval(() => {
    console.log("🟢 Server hali ishlayapti...");
}, 5000);