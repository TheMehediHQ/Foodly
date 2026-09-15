require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createAuthMiddleware } = require("./auth.middleware");

const app = express();
const apiRouter = express.Router();
const PORT = process.env.PORT || 5000;
const COOKIE_NAME = "token";

// Trust proxy when behind a proxy (Vercel, Heroku, Cloudflare)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// --- Server Health Check ---
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Server is running." });
});

// Configure allowed origins
const allowedOrigins = [
  "https://foodly.mehedi-hasan.me",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        console.error("CORS Error: Origin not allowed:", origin);
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Cookie options helper
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

// --- MongoDB setup ---
const DB_USER = process.env.DB_USER || process.env.NAME;
const DB_PASS = process.env.DB_PASS || process.env.PASS;
const DB_NAME = process.env.DB_NAME || "foodsdb";
const DB_CLUSTER = process.env.DB_CLUSTER || "cluster0.onrfrlh.mongodb.net";

const uri =
  DB_USER && DB_PASS
    ? `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER}/?retryWrites=true&w=majority&appName=Cluster0`
    : null;

const client = uri
  ? new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })
  : null;

let foods;
let users;
let dbReady = false;
let dbInitInFlight = null;

const initDb = async () => {
  if (dbReady && foods && users) {
    return;
  }

  if (dbInitInFlight) {
    await dbInitInFlight;
    return;
  }

  if (!client) {
    throw new Error("Missing MongoDB credentials. Set DB_USER and DB_PASS.");
  }

  dbInitInFlight = (async () => {
    await client.connect();
    const db = client.db(DB_NAME);
    foods = db.collection("foods");
    users = db.collection("users");

    try {
      await users.createIndex({ firebaseUid: 1 }, { unique: true });
      await users.createIndex({ email: 1 });
    } catch {
      // index might already exist
    }

    dbReady = true;
    console.log("Connected to MongoDB");
  })();

  try {
    await dbInitInFlight;
  } finally {
    dbInitInFlight = null;
  }
};

const requireDb = async (req, res, next) => {
  try {
    await initDb();
    if (!foods || !users) {
      return res.status(503).json({ ok: false, message: "Database not ready. Try again." });
    }
    next();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    res.status(503).json({ ok: false, message: "Database not ready. Try again." });
  }
};

// --- Auth & RBAC Middleware ---
const { verifyAuth, requireAdmin } = createAuthMiddleware(() => users);

// --- Auth Endpoints ---

// Get current user profile and authoritative role from MongoDB
apiRouter.get("/users/me", requireDb, verifyAuth, (req, res) => {
  res.json({
    ok: true,
    data: {
      firebaseUid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Legacy JWT cookie issue (kept for backwards compatibility)
apiRouter.post("/jwt", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ ok: false, message: "Email is required." });
  }
  const secret = process.env.JWT_SECRET || "fallback_secret";
  const token = jwt.sign({ email }, secret, { expiresIn: "2h" });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 });
  res.json({ ok: true, message: "Token issued successfully." });
});

// Logout - clear the JWT cookie
apiRouter.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.json({ ok: true, message: "Logged out successfully." });
});

// --- Food Routes ---

// Public: list all foods
apiRouter.get("/foods", requireDb, async (req, res) => {
  try {
    const list = await foods.find().toArray();
    res.json({ ok: true, data: list });
  } catch (err) {
    console.error("GET /foods error:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch foods." });
  }
});

// Protected: add food
apiRouter.post("/foods", requireDb, verifyAuth, async (req, res) => {
  try {
    const { title, category, quantity, expiryDate, description, image } = req.body;
    const newFood = {
      title,
      category,
      quantity: Number(quantity) || 1,
      expiryDate,
      description: description || "",
      image: image || "",
      userId: req.user.uid,
      userEmail: req.user.email,
      addedDate: new Date().toISOString(),
      createdAt: new Date(),
    };
    const result = await foods.insertOne(newFood);
    res.status(201).json({
      ok: true,
      message: "Food added successfully.",
      data: { ...newFood, _id: result.insertedId },
    });
  } catch (err) {
    console.error("POST /foods error:", err);
    res.status(500).json({ ok: false, message: "Failed to add food." });
  }
});

// Protected: delete food with strict ownership/admin check
apiRouter.delete("/foods/:id", requireDb, verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ ok: false, message: "Invalid food ID." });
    }

    const food = await foods.findOne({ _id: objectId });
    if (!food) {
      return res.status(404).json({ ok: false, message: "Food not found." });
    }

    // Ownership check: must be creator OR admin
    const isOwner =
      (food.userEmail && food.userEmail.toLowerCase() === req.user.email.toLowerCase()) ||
      (food.userId && food.userId === req.user.uid);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        ok: false,
        message: "Forbidden: You do not have permission to delete this food.",
      });
    }

    await foods.deleteOne({ _id: objectId });
    res.json({ ok: true, message: "Food deleted successfully." });
  } catch (err) {
    console.error("DELETE /foods/:id error:", err);
    res.status(500).json({ ok: false, message: "Failed to delete food." });
  }
});

// Protected: update food with strict ownership/admin check
apiRouter.put("/foods/:id", requireDb, verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ ok: false, message: "Invalid food ID." });
    }

    const food = await foods.findOne({ _id: objectId });
    if (!food) {
      return res.status(404).json({ ok: false, message: "Food not found." });
    }

    // Ownership check: must be creator OR admin
    const isOwner =
      (food.userEmail && food.userEmail.toLowerCase() === req.user.email.toLowerCase()) ||
      (food.userId && food.userId === req.user.uid);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        ok: false,
        message: "Forbidden: You do not have permission to modify this food.",
      });
    }

    const { title, category, quantity, expiryDate, description, image } = req.body;
    const updateFields = { updatedAt: new Date() };
    if (title !== undefined) updateFields.title = title;
    if (category !== undefined) updateFields.category = category;
    if (quantity !== undefined) updateFields.quantity = Number(quantity);
    if (expiryDate !== undefined) updateFields.expiryDate = expiryDate;
    if (description !== undefined) updateFields.description = description;
    if (image !== undefined) updateFields.image = image;

    await foods.updateOne({ _id: objectId }, { $set: updateFields });
    const updatedFood = await foods.findOne({ _id: objectId });
    res.json({ ok: true, message: "Food updated successfully.", data: updatedFood });
  } catch (err) {
    console.error("PUT /foods/:id error:", err);
    res.status(500).json({ ok: false, message: "Failed to update food." });
  }
});

// GET single food item by ID
apiRouter.get("/foods/:id", requireDb, async (req, res) => {
  try {
    const id = req.params.id;
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ ok: false, message: "Invalid food ID." });
    }

    const food = await foods.findOne({ _id: objectId });
    if (!food) {
      return res.status(404).json({ ok: false, message: "Food not found." });
    }
    res.json({ ok: true, data: food });
  } catch {
    res.status(500).json({ ok: false, message: "Failed to fetch food." });
  }
});

// Protected: Post a new note to a food item
apiRouter.post("/foods/notes/:id", requireDb, verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ ok: false, message: "Invalid food ID." });
    }

    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ ok: false, message: "Note content is required." });
    }

    const newNote = {
      note: note.trim(),
      postedBy: req.user.email,
      postedAt: new Date().toISOString(),
    };

    const result = await foods.updateOne({ _id: objectId }, { $push: { notes: newNote } });
    if (result.modifiedCount === 1) {
      res.status(201).json({ ok: true, message: "Note added successfully.", data: newNote });
    } else {
      res.status(404).json({ ok: false, message: "Food not found." });
    }
  } catch (err) {
    console.error("POST /foods/notes/:id error:", err);
    res.status(500).json({ ok: false, message: "Failed to add note." });
  }
});

// --- Admin Endpoints ---

// Admin: Get overall statistics
apiRouter.get("/admin/stats", requireDb, verifyAuth, requireAdmin, async (req, res) => {
  try {
    const totalFoods = await foods.countDocuments();
    const totalUsers = await users.countDocuments();
    const categories = await foods.distinct("category");

    res.json({
      ok: true,
      data: {
        totalFoods,
        totalUsers,
        totalCategories: categories.length,
      },
    });
  } catch (err) {
    console.error("GET /admin/stats error:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch admin stats." });
  }
});

// Admin: List all foods for moderation
apiRouter.get("/admin/foods", requireDb, verifyAuth, requireAdmin, async (req, res) => {
  try {
    const list = await foods.find().sort({ _id: -1 }).toArray();
    res.json({ ok: true, data: list });
  } catch (err) {
    console.error("GET /admin/foods error:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch foods." });
  }
});

// Admin: List all registered users
apiRouter.get("/admin/users", requireDb, verifyAuth, requireAdmin, async (req, res) => {
  try {
    const userList = await users
      .find({}, { projection: { firebaseUid: 1, email: 1, role: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ ok: true, data: userList });
  } catch (err) {
    console.error("GET /admin/users error:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch users." });
  }
});

app.use("/api", apiRouter);

initDb().catch((err) => {
  console.error("MongoDB connection failed:", err);
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
