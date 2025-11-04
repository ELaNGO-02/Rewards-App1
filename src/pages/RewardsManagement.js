// src/pages/RewardsManagement.js
import React, { useState, useEffect } from "react";
import CustomerList from "../components/CustomerList";
import {
    fetchTransactions,
    addCustomer,
    upsertReward,
    deleteReward,
} from "../api";
import { processTransactions } from "../utils/calculations";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RewardsManagement = ({ customers, setCustomers }) => {
    const [loading, setLoading] = useState(customers.length === 0);

    // New Customer Form
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [newCustomerId, setNewCustomerId] = useState("");
    const [newCustomerRewards, setNewCustomerRewards] = useState({
        monthYear: "",
        points: "",
    });

    // Month-Year dropdowns
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    const monthYearOptions = years.flatMap((year) =>
        months.map((m) => `${m} ${year}`)
    );

    // Load data if not already loaded
    useEffect(() => {
        const loadData = async () => {
            if (customers.length > 0) {
                setLoading(false);
                return;
            }
            try {
                const transactions = await fetchTransactions();
                const processed = processTransactions(transactions);
                setCustomers(processed);
                toast.success("Data loaded from database!");
            } catch (err) {
                console.error("[UI] Failed to load transactions:", err);
                toast.error("Failed to load transactions.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [customers, setCustomers]);

    // ADD Customer
    const handleAddCustomer = async () => {
        const idNum = Number(newCustomerId);

        if (!idNum || !newCustomerRewards.monthYear || !newCustomerRewards.points) {
            toast.warning("Please fill all fields.");
            return;
        }

        if (customers.some((c) => c.id === idNum)) {
            toast.error(`Customer ${idNum} already exists.`);
            return;
        }

        try {
            // Add to backend
            await addCustomer(idNum);
            await upsertReward(idNum, newCustomerRewards.monthYear, Number(newCustomerRewards.points));

            // Update shared state for instant UI
            const newCustomer = {
                id: idNum,
                monthlyRewards: { [newCustomerRewards.monthYear]: Number(newCustomerRewards.points) },
                totalRewards: Number(newCustomerRewards.points),
            };
            setCustomers((prev) => [...prev, newCustomer]);

            toast.success(`Customer ${idNum} added successfully!`);
            setShowNewCustomerForm(false);
            setNewCustomerId("");
            setNewCustomerRewards({ monthYear: "", points: "" });
        } catch (err) {
            console.error("[UI] Add customer failed:", err);
            toast.error("Failed to save to database.");
        }
    };

    // UPDATE Reward
    const handleUpdate = async (customerId, monthYear, points) => {
        try {
            await upsertReward(customerId, monthYear, points);
            setCustomers((prev) =>
                prev.map((c) =>
                    c.id === customerId
                        ? {
                            ...c,
                            monthlyRewards: { ...c.monthlyRewards, [monthYear]: points },
                            totalRewards: Object.values({ ...c.monthlyRewards, [monthYear]: points }).reduce((sum, p) => sum + p, 0),
                        }
                        : c
                )
            );
            toast.success("Reward updated successfully!");
        } catch (err) {
            console.error("[UI] Update failed:", err);
            toast.error("Failed to update reward.");
        }
    };

    // DELETE Reward
    const handleDelete = async (customerId, monthYear) => {
        try {
            await deleteReward(customerId, monthYear);
            setCustomers((prev) =>
                prev.map((c) =>
                    c.id === customerId
                        ? {
                            ...c,
                            monthlyRewards: Object.fromEntries(
                                Object.entries(c.monthlyRewards).filter(([m]) => m !== monthYear)
                            ),
                            totalRewards: Object.values(
                                Object.fromEntries(
                                    Object.entries(c.monthlyRewards).filter(([m]) => m !== monthYear)
                                )
                            ).reduce((sum, p) => sum + p, 0),
                        }
                        : c
                )
            );
            toast.success("Reward deleted!");
        } catch (err) {
            console.error("[UI] Delete failed:", err);
            toast.error("Failed to delete reward.");
        }
    };

    if (loading) return <div>Loading data...</div>;

    return (
        <div className="page-container">
            <h1>Rewards Management (MySQL)</h1>

            {!showNewCustomerForm ? (
                <button onClick={() => setShowNewCustomerForm(true)}>➕ Add New Customer</button>
            ) : (
                <div className="new-customer-form">
                    <h3>Add New Customer</h3>
                    <input
                        type="number"
                        placeholder="Customer ID"
                        value={newCustomerId}
                        onChange={(e) => setNewCustomerId(e.target.value)}
                    />
                    <select
                        value={newCustomerRewards.monthYear}
                        onChange={(e) =>
                            setNewCustomerRewards({ ...newCustomerRewards, monthYear: e.target.value })
                        }
                    >
                        <option value="">Select Month-Year</option>
                        {monthYearOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Points"
                        value={newCustomerRewards.points}
                        onChange={(e) =>
                            setNewCustomerRewards({ ...newCustomerRewards, points: e.target.value })
                        }
                    />
                    <button onClick={handleAddCustomer}>Save</button>
                    <button onClick={() => setShowNewCustomerForm(false)}>Cancel</button>
                </div>
            )}

            <CustomerList customers={customers} onUpdate={handleUpdate} onDelete={handleDelete} />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default RewardsManagement;
