require("dotenv").config();
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
 ssl: {
  rejectUnauthorized: false,
},
  waitForConnections: true,
  connectionLimit: 10,
});

console.log("DATABASE:", process.env.DB_NAME);
db.query(`
  CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    price VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL
  )
`)
.then(() => {
  console.log("Cars table tayyor!");
})
.catch((err) => {
  console.error("Cars table yaratishda xato:", err);
});
console.log("ADMIN_LOGIN:", process.env.ADMIN_LOGIN);
console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD ? "YUKLANDI" : "YUKLANMADI");
const express = require("express");
const cors = require("cors");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;


const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
    secret: "BBA_CARS_SECRET_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));
app.post("/admin/login", (req, res) => {
    console.log("ADMIN LOGIN SO'ROVI KELDI");
    
    const { login, password } = req.body;

    if (login === process.env.ADMIN_LOGIN &&
        password === process.env.ADMIN_PASSWORD) {

        req.session.isAdmin = true;

        return res.json({
            success: true
        });
    }

    res.json({
        success: false,
        message: "Login yoki parol noto'g'ri"
    });
});
app.get("/admin/check", (req, res) => {
    if (req.session.isAdmin) {
        return res.json({
            success: true
        });
    }

    res.status(401).json({
        success: false
    });
});
app.use("/images", express.static("images"));
app.use(express.static("../"));
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ MySQL ulandi!");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL ulanmadi:", err.message);
  }
})();

app.get("/", (req, res) => {
    res.send("BBA CARS backend ishlayapti!");
});
app.get("/cars", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cars ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
app.post("/cars", upload.single("image"), async (req, res) => {
    try {

       const { name, brand, price } = req.body;
       const image = req.file ? "/images/" + req.file.filename : "";

        await db.query(
            "INSERT INTO cars (name, brand, price, image) VALUES (?, ?, ?, ?)",
            [name, brand, price, image]
        );

        res.json({
            success: true,
            message: "Avtomobil muvaffaqiyatli qo'shildi!"
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});
app.delete("/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM cars WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Avtomobil o‘chirildi"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
app.put("/cars/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand, price, image } = req.body;

        const [result] = await db.query(
    "UPDATE cars SET name = ?, brand = ?, price = ?, image = ? WHERE id = ?",
    [name, brand, price, image, id]
);

console.log("EDIT ID:", id);
console.log("EDIT RESULT:", result);

if (result.affectedRows === 0) {
    return res.status(404).json({
        success: false,
        message: "Bu ID bo‘yicha avtomobil topilmadi"
    });
}

res.json({
    success: true,
    message: "Avtomobil muvaffaqiyatli tahrirlandi"
});
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
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