// App.test.js
import { render, screen, waitFor } from "@testing-library/react";
import App from "../app";
import * as api from "../api";
import { processTransactions } from "../utils/calculations";
import "@testing-library/jest-dom"; // makes toBeInTheDocument work

// Mock processTransactions so we don’t depend on the full logic
jest.mock("../utils/calculations", () => ({
    processTransactions: jest.fn(),
}));

describe("<App />", () => {
    test("renders loading state first", () => {
        render(<App />);
        expect(
            screen.getByText(/Loading customer rewards data/i)
        ).toBeInTheDocument();
    });

    test("loads and displays customer data", async () => {
        // Mock API to return fake transactions
        jest.spyOn(api, "fetchTransactions").mockResolvedValueOnce([
            { customerId: 1, purchaseAmount: 120, purchaseDate: "2025-07-15T00:00:00" },
        ]);

        // Mock processed data (make sure it matches how CustomerList renders it)
        processTransactions.mockReturnValueOnce([
            {
                customerId: 1,
                name: "Customer 1",
                monthlyRewards: { "July 2025": 90 },
                totalRewards: 90,
            },
        ]);

        render(<App />);

        // Wait for data to appear in UI
        await waitFor(() =>
            expect(screen.getByText(/Customer ID:/i)).toBeInTheDocument()
        );

        // Verify total rewards appears
        expect(screen.getByText(/90/i)).toBeInTheDocument();
    });

    test("shows error message when API fails", async () => {
        jest.spyOn(api, "fetchTransactions").mockRejectedValueOnce(
            new Error("API error: Failed to fetch transactions.")
        );

        render(<App />);

        await waitFor(() =>
            expect(
                screen.getByText(/Failed to load data. Please try again later/i)
            ).toBeInTheDocument()
        );
    });
});
