// // server.js
// import express from "express";
// import cors from "cors";
// import fs from "fs";

// const app = express();
// const PORT = 3000;

// app.use(express.json());
// app.use(cors({ origin: "http://localhost:3001", methods: ["GET", "POST", "PUT", "DELETE"] }));


// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} BODY:`, req.body);
//   next();
// });

// // Read JSON into memory
// let transactions = JSON.parse(fs.readFileSync("./public/transactions.json", "utf8"));
// const saveTransactions = () => {
//   fs.writeFileSync("./public/transactions.json", JSON.stringify(transactions, null, 2), "utf8");
// };

// // GET
// app.get("/api/getCustomerTransactions", (req, res) => {
//   try {
//     const { customerId } = req.query;
//     let filtered = transactions;
//     if (customerId) filtered = transactions.filter((t) => t.customerId === Number(customerId));
//     console.log("[Server] Returning transactions:", filtered.length);
//     res.json(filtered);
//   } catch (err) {
//     console.error("[Server] GET error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // POST
// app.post("/api/addTransaction", (req, res) => {
//   try {
//     const newTransaction = req.body;
//     if (!newTransaction.customerId || newTransaction.purchaseAmount == null || !newTransaction.purchaseDate) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     const newId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id)) + 1 : 1;
//     newTransaction.id = newId;
//     transactions.push(newTransaction);
//     saveTransactions();
//     console.log("[Server] Transaction added:", newTransaction);
//     res.status(201).json(newTransaction);
//   } catch (err) {
//     console.error("[Server] POST error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // PUT
// app.put("/api/updateTransaction/:id", (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     const index = transactions.findIndex((t) => t.id === id);
//     if (index === -1) return res.status(404).json({ error: "Transaction not found" });
//     transactions[index] = { ...transactions[index], ...req.body };
//     saveTransactions();
//     console.log("[Server] Transaction updated:", transactions[index]);
//     res.json(transactions[index]);
//   } catch (err) {
//     console.error("[Server] PUT error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // DELETE
// app.delete("/api/deleteTransaction/:id", (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     const index = transactions.findIndex((t) => t.id === id);
//     if (index === -1) return res.status(404).json({ error: "Transaction not found" });
//     const deleted = transactions.splice(index, 1)[0];
//     saveTransactions();
//     console.log("[Server] Transaction deleted:", deleted);
//     res.json(deleted);
//   } catch (err) {
//     console.error("[Server] DELETE error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/api/addCustomer", (req, res) => {
//   const { customerId, monthYear, points } = req.body;

//   if (!customerId || !monthYear || points == null) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Read current transactions
//   const data = JSON.parse(fs.readFileSync("./public/transactions.json", "utf8"));

//   // Prevent duplicates
//   const exists = data.transactions.some(t => t.customerId === Number(customerId));
//   if (exists) {
//     return res.status(400).json({ error: "Customer already exists" });
//   }

//   // Convert monthYear to a date (pick the 1st day of the month)
//   const [month, year] = monthYear.split(" ");
//   const purchaseDate = new Date(`${month} 1, ${year}`).toISOString();

//   // Add a transaction entry (so it fits existing structure)
//   const newTxn = {
//     id: Date.now(),
//     customerId: Number(customerId),
//     purchaseAmount: 0,
//     purchaseDate,
//   };

//   data.transactions.push(newTxn);

//   fs.writeFileSync("./public/transactions.json", JSON.stringify(data, null, 2));

//   res.json({ success: true, newTxn });
// });

// app.listen(PORT, () => {
//   console.log(`API running at http://localhost:${PORT}/api/getCustomerTransactions`);
// });


// ✅ Add/Update customer reward


import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// MySQL connection
const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Divinity$2025",
    database: "rewards_app",
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
