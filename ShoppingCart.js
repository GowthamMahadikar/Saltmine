class ShoppingCart {
    constructor() {
        this.cart = [];
        this.taxRate = 0.125; // 12.5% tax rate
    }

    async fetchPrice(productId) {
        try {
            console.log(`Fetching price for: ${productId}`);
            const response = await fetch("http://localhost:3001/products");

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            console.log("API Response Data:", data);

            if (!Array.isArray(data)) {
                throw new Error("Unexpected API response format: Expected an array.");
            }

            const product = data.find(p => p.id.toLowerCase() === productId.toLowerCase());

            if (!product) {
                console.warn(`Product '${productId}' not found.`);
                return 0;
            }
            return Math.round(product.price * 100) / 100; // Ensure price is a rounded number
        } catch (error) {
            console.error("Error fetching price:", error.message);
            return 0;
        }
    }

    async addProduct(productId, quantity) {
        const price = await this.fetchPrice(productId);
        if (price === 0) return; // Skip adding if price retrieval fails

        const existingProduct = this.cart.find(item => item.productId === productId);

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            this.cart.push({ productId, quantity, price });
        }

        console.log(`${quantity} x ${productId} added to cart at ₹${Math.round(price * 100) / 100} each.`);
    }

    calculateTotals() {
        let subtotal = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let tax = Math.round(subtotal * this.taxRate * 100) / 100;
        let total = Math.round((subtotal + tax) * 100) / 100;
        return { subtotal, tax, total };
    }

    displayCart() {
        if (this.cart.length === 0) {
            console.log("Your cart is empty.");
            return;
        }

        console.log("\nYour Shopping Cart:");
        this.cart.forEach(item => {
            console.log(`${item.quantity} x ${item.productId} - ₹${Math.round(item.price * 100) / 100} each`);
        });

        const totals = this.calculateTotals();
        console.log(`\nSubtotal: ₹${Math.round(totals.subtotal * 100) / 100}`);
        console.log(`Tax (12.5%): ₹${Math.round(totals.tax * 100) / 100}`);
        console.log(`Total: ₹${Math.round(totals.total * 100) / 100}\n`);
    }
}
     module.exports = ShoppingCart;

// Example Usage
const cart = new ShoppingCart();
(async () => {
    await cart.addProduct("cornflakes", 2);
    await cart.addProduct("weetabix", 1);
    cart.displayCart();
    
    module.exports = ShoppingCart;


})();
