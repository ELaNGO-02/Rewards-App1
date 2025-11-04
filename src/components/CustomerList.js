import React from "react";
import CustomerCard from "./CustomerCard";
import PropTypes from "prop-types";
import "./CustomerList.css";

const CustomerList = ({ customers, onUpdate, onDelete }) => {
    return (
        <div className="customer-list-container">
            {customers.map((customer) => (
                <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

CustomerList.propTypes = {
    customers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            monthlyRewards: PropTypes.objectOf(PropTypes.number).isRequired,
            totalRewards: PropTypes.number.isRequired,
        })
    ).isRequired,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
};

export default CustomerList;
