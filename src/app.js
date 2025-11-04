// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomerList from "./components/CustomerList";
import { fetchTransactions } from "./api";
import { processTransactions } from "./utils/calculations";
import RewardsManagement from "./pages/RewardsManagement";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./app.css";

function Dashboard({ customers, setCustomers }) {
    const [loading, setLoading] = useState(customers.length === 0);
    const [selectedMonth, setSelectedMonth] = useState("All");
    const [selectedYear, setSelectedYear] = useState("All");
    const [showOnlyWithRewards, setShowOnlyWithRewards] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (customers.length > 0) return; // Already loaded
            try {
                const transactions = await fetchTransactions();
                const processed = processTransactions(transactions);
                setCustomers(processed);
                toast.success("Data loaded successfully!");
            } catch (err) {
                console.error(err);
                toast.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [customers, setCustomers]);

    if (loading) return <div>Loading...</div>;

    const filteredCustomers = customers.map((customer) => {
        const filteredRewards = {};
        Object.entries(customer.monthlyRewards).forEach(([monthYear, points]) => {
            const [month, year] = monthYear.split(" ");
            if (
                (selectedMonth === "All" || month === selectedMonth) &&
                (selectedYear === "All" || year === selectedYear)
            ) {
                filteredRewards[monthYear] = points;
            }
        });
        return {
            ...customer,
            monthlyRewards: filteredRewards,
            totalRewards: Object.values(filteredRewards).reduce((a, b) => a + b, 0),
        };
    });

    return (
        <div className="app-container">
            <h1>Retailer Rewards Dashboard</h1>

            <div className="filters">
                <label>
                    Month:
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        <option value="All">All</option>
                        {[
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                        ].map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </label>

                <label>
                    Year:
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="All">All</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                    </select>
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={showOnlyWithRewards}
                        onChange={(e) => setShowOnlyWithRewards(e.target.checked)}
                    />
                    Show only customers with rewards
                </label>
            </div>

            <CustomerList
                customers={
                    showOnlyWithRewards
                        ? filteredCustomers.filter((c) => c.totalRewards > 0)
                        : filteredCustomers
                }
            />

            <Link to="/manage-rewards" style={{ display: "block", marginTop: 20 }}>
                Go to Manage Rewards
            </Link>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
}

function App() {
    const [customers, setCustomers] = useState([]);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={<Dashboard customers={customers} setCustomers={setCustomers} />}
                />
                <Route
                    path="/manage-rewards"
                    element={<RewardsManagement customers={customers} setCustomers={setCustomers} />}
                />
            </Routes>
        </Router>
    );
}

export default App;
