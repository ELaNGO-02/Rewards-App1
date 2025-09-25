import React from 'react';
import './CustomerCard.css';

const CustomerCard = ({ customer }) => {
    const { id, monthlyRewards, totalRewards } = customer;
    const months = Object.keys(monthlyRewards);

    return (
        <div className="customer-card">
            <h2>Customer ID: {id}</h2>
            <div className="rewards-details">
                <h3>Monthly Rewards:</h3>
                <ul>
                    {months.map(month => (
                        <li key={month}>
                            <strong>{month}:</strong> {monthlyRewards[month]} points
                        </li>
                    ))}
                </ul>
            </div>
            <div className="total-rewards">
                <h3>Total Rewards: {totalRewards} points</h3>
            </div>
        </div>
    );
};

export default CustomerCard;
