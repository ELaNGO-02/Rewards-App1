import { transactionsData } from './utils/data';

export const fetchTransactions = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(transactionsData);
        }, 1000); // Simulate a 1-second network delay
    });
};
