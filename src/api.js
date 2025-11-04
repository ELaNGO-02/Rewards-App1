const API_BASE = "http://localhost:3001/api";

// Get all transactions
export const fetchTransactions = async () => {
    const res = await fetch(`${API_BASE}/transactions`);
    console.log(res.FormData);
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return res.json();
};

// Get all customers
export const fetchCustomers = async () => {
    const res = await fetch(`${API_BASE}/customers`);
    if (!res.ok) throw new Error("Failed to fetch customers");
    return res.json();
};

// Add / Update a reward (Upsert)
export const upsertReward = async (customerId, monthYear, points) => {
    const res = await fetch(`${API_BASE}/rewards/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, monthYear, points }),
    });
    return res.json();
};

// Delete a reward
export const deleteReward = async (customerId, monthYear) => {
    const res = await fetch(`${API_BASE}/rewards/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, monthYear }),
    });
    return res.json();
};

// Add new customer
export const addCustomer = async (customerId) => {
    const res = await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
    });
    return res.json();
};
