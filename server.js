const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT =  3002;

app.use(cors());
app.use(express.json());

let db; // global reference

(async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connected to MySQL database");

    const calculatePoints = (amount) => {
        let points = 0;

        if (amount > 100) {
            // 2 points for every dollar over $100
            points += (amount - 100) * 2;

            points += 50;
        } else if (amount > 50) {

            points += (amount - 50) * 1;
        }

        return points;
     };


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

    app.get("/api/rewards", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM rewards_app.rewards");
        res.json(rows);
      } catch (err) {
        console.error("[API] Get customers error:", err);
        res.status(500).json({ error: "Failed to fetch customers" });
      }
    });

    // Add / Upsert reward (transaction)
    // Add / Upsert reward (transaction)
app.post("/api/rewards/upsert", async (req, res) => {
    console.log("request body:", req.body);
  const { customerId, monthYear, purchaseAmount } = req.body;

  try {
    const [month, year] = monthYear.split(" ");
    const monthNum = ("0" + (new Date(`${month} 1`).getMonth() + 1)).slice(-2);
    const date = `${year}-${monthNum}-01`;

    // Check if transaction exists
    const [existing] = await db.query(
      "SELECT * FROM rewards_app.transactions WHERE customerId = ? AND purchaseDate LIKE ?",
      [customerId, `${year}-${monthNum}%`]
    );

    let transactionId;
    if (existing.length > 0) {
      // Update existing transaction
      await db.query(
        "UPDATE rewards_app.transactions SET purchaseAmount = ? WHERE id = ?",
        [purchaseAmount, existing[0].id]
      );
      transactionId = existing[0].id;
    } else {
      // Create new transaction
      const [result] = await db.query(
        "INSERT INTO rewards_app.transactions (customerId, purchaseAmount, purchaseDate) VALUES (?, ?, ?)",
        [customerId, purchaseAmount, date]
      );
      transactionId = result.insertId;
    }

    // Calculate points
    const rewardPoints = calculatePoints(purchaseAmount);
    console.log("Calculated reward points:", rewardPoints);

    // Check if a reward already exists for this transaction
    const [existingReward] = await db.query(
      "SELECT * FROM rewards_app.rewards WHERE transactionId = ?",
      [transactionId]
    );

    if (existingReward.length > 0) {
      // Update the existing reward entry
      await db.query(
        "UPDATE rewards_app.rewards SET rewardPoints = ?, createdAt = ?, purchaseAmount = ? WHERE transactionId = ?",
        [rewardPoints,  date, purchaseAmount, transactionId]
      );
    } 
    else {

      await db.query(
        "INSERT INTO rewards_app.rewards (transactionId, customerId, rewardPoints,createdAt,purchaseAmount) VALUES (?, ?, ?, ?, ?)",
        [transactionId, customerId, rewardPoints, date, purchaseAmount]
      );
    }

    // Update total rewards in customers table
    const [total] = await db.query(
      "SELECT SUM(rewardPoints) AS total FROM rewards_app.rewards WHERE customerId = ?",
      [customerId]
    );

    await db.query(
      "UPDATE rewards_app.customers SET totalRewards = ? WHERE customerId = ?",
      [total[0].total || 0, customerId]
    );

    res.json({
      success: true,
      message: "Reward updated successfully",
      transactionId,
      rewardPoints,
      totalRewards: total[0].total || 0,
    });

  } catch (err) {
    console.error("[API] Upsert reward error:", err);
    res.status(500).json({ error: err.message });
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

    // --- START SERVER ---
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  } catch (err) {
    console.error(" Failed to connect to MySQL:", err.message);
  }
})();
