import React, { useState, useEffect } from 'react';
import CustomerList from './components/CustomerList';
import { fetchTransactions } from './api';
import { processTransactions } from './utils/calculations';
import './app.css';

function App() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getRewardsData = async () => {
            try {
                const transactions = await fetchTransactions();
                const processedData = processTransactions(transactions);
                setCustomers(processedData);
            } catch (err) {
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        getRewardsData();
    }, []);

    if (loading) {
        return <div className="loading-message">Loading customer rewards data...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="app-container">
            <h1 className="app-title">Retailer Rewards Program</h1>
            {customers.length > 0 ? (
                <CustomerList customers={customers} />
            ) : (
                <div className="no-data-message">No customer data available.</div>
            )}
        </div>
    );
}

export default App;
