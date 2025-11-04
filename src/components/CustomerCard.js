import React, { useState } from "react";
import PropTypes from "prop-types";
import "./CustomerCard.css";

const CustomerCard = ({ customer = {}, onUpdate, onDelete }) => {
    const { id = "N/A", monthlyRewards = {} } = customer; // safe defaults
    const months = Object.keys(monthlyRewards);

    // Hooks must be unconditional
    const [isEditing, setIsEditing] = useState(false);
    const [editMonth, setEditMonth] = useState("");
    const [editPoints, setEditPoints] = useState(0);

    const [newMonth, setNewMonth] = useState("");
    const [newYear, setNewYear] = useState("");
    const [newPoints, setNewPoints] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);

    const handleSaveEdit = () => {
        onUpdate?.(id, editMonth, Number(editPoints));
        setIsEditing(false);
    };

    const handleAddReward = () => {
        if (newMonth && newYear && newPoints > 0) {
            const monthYear = `${newMonth} ${newYear}`;
            onUpdate?.(id, monthYear, Number(newPoints));
            setNewMonth("");
            setNewYear("");
            setNewPoints(0);
            setShowAddForm(false);
        }
    };

    const handleDeleteReward = (month) => {
        onDelete?.(id, month);
    };

    return (
        <div className="customer-card">
            <h3>Customer ID: {id}</h3>

            <div className="rewards-details">
                <h3>Monthly Rewards:</h3>
                {months.length === 0 ? (
                    <p>No rewards yet</p>
                ) : (
                    <ul>
                        {months.map((month) => (
                            <li key={month}>
                                <strong>{month}:</strong> {monthlyRewards[month]} points{" "}
                                {onUpdate && (
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditMonth(month);
                                            setEditPoints(monthlyRewards[month]);
                                        }}
                                    >
                                        Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button onClick={() => handleDeleteReward(month)}>Delete</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isEditing && (
                <div className="edit-form">
                    <input
                        type="number"
                        value={editPoints}
                        onChange={(e) => setEditPoints(e.target.value)}
                    />
                    <button onClick={handleSaveEdit}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            )}

            <div className="total-rewards">
                <h3>
                    Total Rewards:{" "}
                    {Object.values(monthlyRewards).reduce((a, b) => a + b, 0)} points
                </h3>
            </div>

            {onUpdate && (
                showAddForm ? (
                    <div className="add-form">
                        <select
                            value={newMonth}
                            onChange={(e) => setNewMonth(e.target.value)}
                        >
                            <option value="">Select Month</option>
                            {[
                                "January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December",
                            ].map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Year (e.g., 2025)"
                            value={newYear}
                            onChange={(e) => setNewYear(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Points"
                            value={newPoints}
                            onChange={(e) => setNewPoints(e.target.value)}
                        />

                        <button onClick={handleAddReward}>Add</button>
                        <button onClick={() => setShowAddForm(false)}>Cancel</button>
                    </div>
                ) : (
                    <button onClick={() => setShowAddForm(true)}>Add New Reward</button>
                )
            )}
        </div>
    );
};

CustomerCard.propTypes = {
    customer: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        monthlyRewards: PropTypes.objectOf(PropTypes.number),
        totalRewards: PropTypes.number,
    }),
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
};

export default CustomerCard;
