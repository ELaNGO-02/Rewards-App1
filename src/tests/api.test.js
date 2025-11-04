// api.test.js
import { fetchTransactions } from "../api";
import { transactionsData } from "../utils/data";

describe("fetchTransactions", () => {
    test("resolves with transactionsData on success", async () => {
        const data = await fetchTransactions(false); // should succeed
        expect(data).toEqual(transactionsData);
    });

    test("rejects with error when shouldFail = true", async () => {
        await expect(fetchTransactions(true)).rejects.toThrow(
            "API error: Failed to fetch transactions."
        );
    });
});
