// Calculate reward points based on purchase amount
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

// Process transactions into customer rewards
export const processTransactions = (transactions) => {
    const customerData = {}; // use object keyed by customerId

    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setMonth(today.getMonth() - 8); // last 8 months

    const recentTransactions = transactions.filter(transaction => {
        const txnDate = new Date(transaction.purchaseDate);
        return txnDate >= cutoffDate && txnDate <= today;
    });

    recentTransactions.forEach(transaction => {
        const { customerId, purchaseAmount, purchaseDate } = transaction;
        const date = new Date(purchaseDate);
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        const monthYear = `${month} ${year}`;

        const points = calculatePoints(purchaseAmount);

        if (!customerData[customerId]) {
            customerData[customerId] = {
                id: customerId,
                monthlyRewards: {},
                totalRewards: 0,
            };
        }

        if (!customerData[customerId].monthlyRewards[monthYear]) {
            customerData[customerId].monthlyRewards[monthYear] = 0;
        }

        customerData[customerId].monthlyRewards[monthYear] += points;
        customerData[customerId].totalRewards += points;
    });

    return Object.values(customerData);
};
