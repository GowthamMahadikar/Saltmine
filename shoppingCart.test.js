global.console = {
    ...console,
    log: jest.fn(),    // Suppresses console.log()
    warn: jest.fn(),   // Suppresses console.warn()
    error: jest.fn(),  // Suppresses console.error()
};
const ShoppingCart = require("./ShoppingCart"); // Adjust based on your file name

// Mock fetch globally
global.fetch = jest.fn();

describe("ShoppingCart", () => {
    let cart;

    beforeEach(() => {
        cart = new ShoppingCart();
        fetch.mockClear(); // Clear previous mocks before each test
    });

    test("fetchPrice should return correct price", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { id: "cornflakes", title: "Cornflakes", price: 2.52 },
                { id: "weetabix", title: "Weetabix", price: 9.98 }
            ],
        });
        

        const price = await cart.fetchPrice("cornflakes");
        expect(price).toBe(2.52);
    });

    test("fetchPrice should return 0 if product is not found", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { id: "cheerios", title: "Cheerios", price: 8.43 }
            ],
        });

        const price = await cart.fetchPrice("cornflakes"); // Product doesn't exist
        expect(price).toBe(0);
    });

    test("fetchPrice should handle API error", async () => {
        fetch.mockRejectedValueOnce(new Error("Network Error"));

        const price = await cart.fetchPrice("cornflakes");
        expect(price).toBe(0);
    });

    test("addProduct should add items to the cart correctly", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { id: "cornflakes", title: "Cornflakes", price: 2.52 }
            ],
        });

        await cart.addProduct("cornflakes", 2);

        expect(cart.cart).toEqual([
            { productId: "cornflakes", quantity: 2, price: 2.52 }
        ]);
    });

    test("addProduct should update quantity if product already exists", async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => [
                { id: "cornflakes", title: "Cornflakes", price: 2.52 }
            ],
        });

        await cart.addProduct("cornflakes", 2);
        await cart.addProduct("cornflakes", 1); // Adding more of the same product

        expect(cart.cart).toEqual([
            { productId: "cornflakes", quantity: 3, price: 2.52 }
        ]);
    });

    test("calculateTotals should return correct totals", async () => {
        cart.cart = [
            { productId: "cornflakes", quantity: 2, price: 2.52 },
            { productId: "weetabix", quantity: 1, price: 9.98 }
        ];
    
        const totals = cart.calculateTotals();
        expect(totals.subtotal).toBeCloseTo(15.02, 2); //
        expect(totals.tax).toBeCloseTo(1.88, 2);      // 
        expect(totals.total).toBeCloseTo(16.90, 2);   // 
    });
    
});
