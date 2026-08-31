require("dotenv").config();
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
const ImageKit = require("@imagekit/nodejs");

const imageKit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const upload = multer({
  storage: multer.memoryStorage()
});

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

(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        image VARCHAR(500) NOT NULL
      )
    `);

    console.log("Cars table tayyor!");

    try {
      await db.query(`
        ALTER TABLE cars
        ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'petrol'
      `);

      console.log("Cars type ustuni tayyor!");
    } catch (err) {
      if (err.message.includes("Duplicate column name")) {
        console.log("Cars type ustuni allaqachon mavjud!");
      } else {
        throw err;
      }
    }
    
  } catch (err) {
    console.error("Cars table/type yaratishda xato:", err);
  }

  try {
    await db.query("ALTER TABLE cars ADD COLUMN year INT NULL");
    console.log("Cars year ustuni tayyor!");
} catch (err) {
    if (err.message.includes("Duplicate column name")) {
        console.log("Cars year ustuni allaqachon mavjud!");
    } else {
        throw err;
    }
}
try {
    await db.query("ALTER TABLE cars ADD COLUMN images TEXT NULL");
    console.log("Cars images ustuni tayyor!");
} catch (err) {
    if (err.message.includes("Duplicate column name")) {
        console.log("Cars images ustuni allaqachon mavjud!");
    } else {
        throw err;
    }
}
try { await db.query( "CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, car VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, phone VARCHAR(100) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)" );
console.log("Orders table tayyor!");
} catch (err) { console.error("Orders table yaratishda xato:", err); }

try {
    await db.query(
        "ALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'new'"
    );
    console.log("Orders status ustuni tayyor!");
} catch (err) {
    if (err.message.includes("Duplicate column name")) {
        console.log("Orders status ustuni allaqachon mavjud!");
    } else {
        throw err;
    }
}

try { const columns = [ ["range", "VARCHAR(100) NULL"], ["battery", "VARCHAR(100) NULL"], ["engine", "VARCHAR(100) NULL"], ["drive", "VARCHAR(100) NULL"], ["power", "VARCHAR(100) NULL"], ["acceleration", "VARCHAR(100) NULL"], ["maxSpeed", "VARCHAR(100) NULL"], ["seats", "INT NULL"], ["length", "INT NULL"], ["wheelbase", "INT NULL"], ["fridge", "VARCHAR(10) NULL"], ["hud", "VARCHAR(10) NULL"], ["faceId", "VARCHAR(10) NULL"], ["massage", "VARCHAR(10) NULL"], ["camera360", "VARCHAR(10) NULL"], ["seatHeating", "VARCHAR(10) NULL"], ["seatVentilation", "VARCHAR(10) NULL"], ["airSuspension", "VARCHAR(10) NULL"] ];
for (const [column, definition] of columns) {
    try {
        await db.query("ALTER TABLE cars ADD COLUMN ?? " + definition, [column]);
        console.log(`Cars ${column} ustuni qo‘shildi!`);
    } catch (err) {
        if (err.message.includes("Duplicate column name")) {
            console.log(`Cars ${column} ustuni allaqachon mavjud!`);
        } else {
            throw err;
        }
    }
}
} catch (err) { console.error("Cars yangi ustunlarini yaratishda xato:", err); }
})();

console.log("ADMIN_LOGIN:", process.env.ADMIN_LOGIN);
console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD ? "YUKLANDI" : "YUKLANMADI");
const express = require("express");
const cors = require("cors");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;


const app = express();
app.set("trust proxy", 1);

app.use(cors({
    origin: [
  "http://localhost:3000",
  "https://bbacars.uz",
  "https://www.bbacars.uz",
  "https://bba-cars-1.onrender.com"
],
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: "BBA_CARS_SECRET_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60 * 24 * 7
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
app.post("/admin/logout", (req, res) => { 
  req.session.destroy((err) => {
     if (err) {
       return res.status(500).json({
         success: false,
          message: "Chiqishda xatolik" 
        }); 
      }
    res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });

    return res.json({
        success: true
    });
});
});
function requireAdmin(req, res, next) { 
  if (req.session && req.session.isAdmin) {
     return next(); }
     return res.status(401).json({
    success: false,
    message: "Admin sifatida tizimga kiring"
});
}
app.use("/images", express.static(path.join(__dirname, "../images")));
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
    console.log("GET /cars ishladi");
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
app.post("/cars", requireAdmin, upload.array("images", 10), async (req, res) => {
  try {
    const {
    name,
    brand,
    price,
    type,
    year,
    range,
    battery,
    engine,
    drive,
    power,
    acceleration,
    maxSpeed,
    seats,
    length,
    wheelbase,
    fridge,
    hud,
    faceId,
    massage,
    camera360,
    seatHeating,
    seatVentilation,
    airSuspension
} = req.body;

    if (!req.files || req.files.length === 0) {
    return res.status(400).json({
        success: false,
        message: "Rasm tanlanmagan"
    });
}

    const imageUrls = [];
for (const file of req.files) { 
  const uploadResponse = await imageKit.files.upload({
     file: file.buffer.toString("base64"), 
     fileName: Date.now() + "-" + file.originalname,
      folder: "/bba-cars"
     });
imageUrls.push(uploadResponse.url);
}
const image = imageUrls[0]; 
const images = JSON.stringify(imageUrls);

    // URL'ni MySQL'ga saqlash
    await db.query(
  "INSERT INTO cars (name, brand, price, image, images, type, year, `range`, battery, engine, drive, power, acceleration, maxSpeed, seats, length, wheelbase, fridge, hud, faceId, massage, camera360, seatHeating, seatVentilation, airSuspension) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
   [name, brand, price, image, images, type, year, range, battery, engine, drive, power, acceleration, maxSpeed, seats, length, wheelbase, fridge, hud, faceId, massage, camera360, seatHeating, seatVentilation, airSuspension]
);

    res.json({
      success: true,
      message: "Avtomobil muvaffaqiyatli qo'shildi!",
      image: image,
      images: imageUrls
    });

  } catch (err) {
    console.error("Rasm yuklashda xatolik:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.delete("/cars/:id", requireAdmin, async (req, res) => {
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
app.put("/cars/:id", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
    name,
    brand,
    price,
    type,
    year,
    range,
    battery,
    engine,
    drive,
    power,
    acceleration,
    maxSpeed,
    seats,
    length,
    wheelbase,
    fridge,
    hud,
    faceId,
    massage,
    camera360,
    seatHeating,
    seatVentilation,
    airSuspension
} = req.body;

        const [result] = await db.query( "UPDATE cars SET name = ?, brand = ?, price = ?, type = ?, year = ?, `range` = ?, battery = ?, engine = ?, drive = ?, power = ?, acceleration = ?, maxSpeed = ?, seats = ?, length = ?, wheelbase = ?, fridge = ?, hud = ?, faceId = ?, massage = ?, camera360 = ?, seatHeating = ?, seatVentilation = ?, airSuspension = ? WHERE id = ?", 
          [ name, brand, price, type, year, range, battery, engine, drive, power, acceleration, maxSpeed, seats, length, wheelbase, fridge, hud, faceId, massage, camera360, seatHeating, seatVentilation, airSuspension, id ] );

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
    const [orderResult] = await db.query(
    "INSERT INTO orders (car, name, phone) VALUES (?, ?, ?)",
    [car, name, phone]
);
console.log("ORDER DB GA YOZILDI:", orderResult.insertId);
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
app.get("/admin/orders", requireAdmin, async (req, res) => { try { const [orders] = await db.query( "SELECT * FROM orders ORDER BY id DESC" );
    res.json(orders);
} catch (err) {
    console.error(err);

    res.status(500).json({
        success: false,
        error: err.message
    });
}
});
app.put("/admin/orders/:id/status", requireAdmin, async (req, res) => {
   try { 
    const { id } = req.params; 
    const { status } = req.body;
    await db.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, id]
    );

    res.json({
        success: true,
        message: "Ariza holati yangilandi"
    });

} catch (err) {
    console.error(err);

    res.status(500).json({
        success: false,
        error: err.message
    });
}
});
app.delete("/admin/orders/:id", requireAdmin, async (req, res) => { 
  try { 
    const { id } = req.params;
    const [result] = await db.query(
        "DELETE FROM orders WHERE id = ?",
        [id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({
            success: false,
            message: "Ariza topilmadi"
        });
    }

    res.json({
        success: true,
        message: "Ariza o‘chirildi"
    });

} catch (err) {
    console.error(err);

    res.status(500).json({
        success: false,
        error: err.message
    });
}
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