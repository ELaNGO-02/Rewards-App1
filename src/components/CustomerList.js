import React from 'react';
import CustomerCard from './CustomerCard';
import './CustomerList.css';

const CustomerList = ({ customers }) => {
    return (
        <div className="customer-list-container">
            {customers.map(customer => (
                <CustomerCard key={customer.id} customer={customer} />
            ))}
        </div>
    );
};

export default CustomerList;
