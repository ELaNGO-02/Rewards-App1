import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// MySQL connection
const db = await mysql.createConnection({
    host: "{DB_HOST}",
    user: "{DB_USER}",
    password: "{DB_PASSWORD}",
    database: "{DB_NAME}",
});

// Get all transactions
app.get("/api/transactions", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM rewards_app.transactions");
        res.json(rows);
    } catch (err) {
        console.error("[API] Get transactions error:", err);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

// Get all customers
app.get("/api/customers", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM rewards_app.customers");
        res.json(rows);
    } catch (err) {
        console.error("[API] Get customers error:", err);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
});

// Add new customer
app.post("/api/customers", async (req, res) => {
    const { customerId } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO rewards_app.customers (customerId) VALUES (?)",
            [customerId]
        );
        res.json({ success: true, insertId: result.insertId });
    } catch (err) {
        console.error("[API] Add customer error:", err);
        res.status(500).json({ error: "Failed to add customer", details: err.message });
    }
});

// Add / Upsert reward (transaction)
app.post("/api/rewards/upsert", async (req, res) => {
    const { customerId, monthYear, points } = req.body;
    try {
        const [month, year] = monthYear.split(" ");
        const monthNum = ("0" + (new Date(`${month} 1`).getMonth() + 1)).slice(-2);
        const date = `${year}-${monthNum}-01`;

        // Check if transaction exists for that month
        const [existing] = await db.query(
            "SELECT * FROM rewards_app.transactions WHERE customerId = ? AND purchaseDate LIKE ?",
            [customerId, `${year}-${monthNum}%`]
        );

        if (existing.length > 0) {
            await db.query(
                "UPDATE rewards_app.transactions SET purchaseAmount = ? WHERE id = ?",
                [points, existing[0].id]
            );
            res.json({ updated: true });
        } else {
            const [result] = await db.query(
                "INSERT INTO rewards_app.transactions (customerId, purchaseAmount, purchaseDate) VALUES (?, ?, ?)",
                [customerId, points, date]
            );
            res.json({ inserted: true, id: result.insertId });
        }
    } catch (err) {
        console.error("[API] Upsert reward error:", err);
        res.status(500).json({ error: "Failed to upsert reward", details: err.message });
    }
});

// Delete reward
app.delete("/api/rewards/delete", async (req, res) => {
    const { customerId, monthYear } = req.body;
    try {
        const [month, year] = monthYear.split(" ");
        const monthNum = ("0" + (new Date(`${month} 1`).getMonth() + 1)).slice(-2);

        const [existing] = await db.query(
            "SELECT * FROM rewards_app.transactions WHERE customerId = ? AND purchaseDate LIKE ?",
            [customerId, `${year}-${monthNum}%`]
        );

        if (existing.length > 0) {
            await db.query("DELETE FROM rewards_app.transactions WHERE id = ?", [existing[0].id]);
            res.json({ deleted: true });
        } else {
            res.json({ deleted: false });
        }
    } catch (err) {
        console.error("[API] Delete reward error:", err);
        res.status(500).json({ error: "Failed to delete reward", details: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
