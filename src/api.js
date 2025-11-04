// // src/api.js
// const BASE_URL = "http://localhost:3000/api/getCustomerTransactions";

// const monthNameToNumber = {
//   January: "01", February: "02", March: "03", April: "04",
//   May: "05", June: "06", July: "07", August: "08",
//   September: "09", October: "10", November: "11", December: "12",
// };

// const formatMonthYear = (monthYear) => {
//   const [month, year] = monthYear.split(" ");
//   return `${year}-${monthNameToNumber[month]}`;
// };


// export const fetchTransactions = async () => {
//   try {
//     console.log("[API] Fetching all transactions...");
//     const res = await fetch(BASE_URL);
//     if (!res.ok) throw new Error("Failed to fetch transactions");
//     const data = await res.json();
//     console.log("[API] Transactions received:", data);
//     return data;
//   } catch (err) {
//     console.error("[API] fetchTransactions error:", err.message);
//     throw err;
//   }
// };

// export const createTransaction = async (transaction) => {
//   try {
//     console.log("[API] Creating transaction:", transaction);
//     const res = await fetch(`${BASE_URL.replace("/getCustomerTransactions","/addTransaction")}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(transaction),
//     });
//     if (!res.ok) throw new Error("Failed to create transaction");
//     const data = await res.json();
//     console.log("[API] Transaction created:", data);
//     return data;
//   } catch (err) {
//     console.error("[API] createTransaction error:", err.message);
//     throw err;
//   }
// };

// export async function addNewCustomer(customerId, monthYear, points) {
//   const res = await fetch("http://localhost:3000/api/addCustomer", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ customerId, monthYear, points }),
//   });
//   return res.json();
// }


// export const updateTransaction = async (id, updatedData) => {
//   try {
//     console.log(`[API] Updating transaction ID=${id} with data:`, updatedData);
//     const res = await fetch(`${BASE_URL.replace("/getCustomerTransactions","/updateTransaction")}/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updatedData),
//     });
//     if (!res.ok) throw new Error("Failed to update transaction");
//     const data = await res.json();
//     console.log("[API] Transaction updated:", data);
//     return data;
//   } catch (err) {
//     console.error("[API] updateTransaction error:", err.message);
//     throw err;
//   }
// };

// export const deleteTransaction = async (id) => {
//   try {
//     console.log(`[API] Deleting transaction ID=${id}`);
//     const res = await fetch(`${BASE_URL.replace("/getCustomerTransactions","/deleteTransaction")}/${id}`, { method: "DELETE" });
//     if (!res.ok) throw new Error("Failed to delete transaction");
//     console.log("[API] Transaction deleted:", id);
//     return true;
//   } catch (err) {
//     console.error("[API] deleteTransaction error:", err.message);
//     throw err;
//   }
// };

// export const upsertCustomerReward = async (customerId, monthYear, points) => {
//   try {
//     console.log(`[API] Upserting reward: customerId=${customerId}, monthYear=${monthYear}, points=${points}`);
//     const monthPrefix = formatMonthYear(monthYear);
//     const res = await fetch(`${BASE_URL}?customerId=${customerId}`);
//     if (!res.ok) throw new Error("Failed to fetch customer transactions");
//     const transactions = await res.json();

//     let existing = transactions.find((t) => t.purchaseDate.startsWith(monthPrefix));
//     if (existing) {
//       const updatedTxn = await updateTransaction(existing.id, { ...existing, purchaseAmount: points });
//       console.log("[API] Updated existing transaction:", updatedTxn);
//       return updatedTxn;
//     } else {
//       const newTxn = await createTransaction({ customerId, purchaseAmount: points, purchaseDate: monthPrefix + "-01T00:00:00" });
//       console.log("[API] Created new transaction:", newTxn);
//       return newTxn;
//     }
//   } catch (err) {
//     console.error("[API] upsertCustomerReward error:", err.message);
//     throw err;
//   }
// };

// export const deleteCustomerReward = async (customerId, monthYear) => {
//   try {
//     console.log(`[API] Deleting customer reward: customerId=${customerId}, monthYear=${monthYear}`);
//     const monthPrefix = formatMonthYear(monthYear);
//     const res = await fetch(`${BASE_URL}?customerId=${customerId}`);
//     if (!res.ok) throw new Error("Failed to fetch customer transactions");
//     const transactions = await res.json();

//     const txn = transactions.find((t) => t.purchaseDate.startsWith(monthPrefix));
//     if (txn) {
//       await deleteTransaction(txn.id);
//       console.log("[API] Reward deleted for transaction:", txn.id);
//       return true;
//     }
//     console.log("[API] No reward found to delete");
//     return false;
//   } catch (err) {
//     console.error("[API] deleteCustomerReward error:", err.message);
//     throw err;
//   }
// };

// src/api.js


// src/api.js
// src/api.js




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
