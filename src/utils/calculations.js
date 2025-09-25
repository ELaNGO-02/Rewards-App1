export const calculatePoints = (amount) => {
    let points = 0;
    if (amount > 100) {
        // 2 points for every dollar over $100
        points += (amount - 100) * 2;
        // Plus 1 point for every dollar between $50 and $100 (which is 50 points)
        points += 50;
    } else if (amount > 50) {
        // 1 point for every dollar between $50 and $100
        points += (amount - 50) * 1;
    }
    return points;
};

export const processTransactions = (transactions) => {
    const customerData = {};

    transactions.forEach(transaction => {
        const { customerId, purchaseAmount, purchaseDate } = transaction;
        const transactionDate = new Date(purchaseDate);
        const month = transactionDate.toLocaleString('en-US', { month: 'long' });

        const points = calculatePoints(purchaseAmount);

        // Initialize customer object if it doesn't exist
        if (!customerData[customerId]) {
            customerData[customerId] = {
                id: customerId,
                monthlyRewards: {},
                totalRewards: 0,
            };
        }

        // Initialize monthly reward object if it doesn't exist
        if (!customerData[customerId].monthlyRewards[month]) {
            customerData[customerId].monthlyRewards[month] = 0;
        }

        // Add points to the specific month and total
        customerData[customerId].monthlyRewards[month] += points;
        customerData[customerId].totalRewards += points;
    });

    // Convert the object to an array for easier rendering in React
    return Object.values(customerData);
};