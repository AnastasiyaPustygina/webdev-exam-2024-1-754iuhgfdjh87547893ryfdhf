// Notifications
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.backgroundColor = type === "success" ? "green" : type === "error" ? "red" : "blue";
    notification.style.color = "white";
    notification.style.padding = "10px";
    notification.style.marginBottom = "5px";

    const notificationArea = document.getElementById("notifications");
    notificationArea.style.display = "block";
    notificationArea.appendChild(notification);

    setTimeout(() => {
        notificationArea.removeChild(notification);
        if (!notificationArea.hasChildNodes()) {
            notificationArea.style.display = "none";
        }
    }, 5000);
}

// Product Listing
function loadProducts() {
    // Simulate API call
    const products = [
        { id: 1, name: "Laptop", price: 1000, discount: 10 },
        { id: 2, name: "Phone", price: 500, discount: 0 },
    ];

    const productsContainer = document.getElementById("products");
    productsContainer.innerHTML = "";

    products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <button>Add to Cart</button>
        `;

        productsContainer.appendChild(productCard);
    });
}

// Load initial products
document.addEventListener("DOMContentLoaded", loadProducts);

// Handle Filters
document.getElementById("filters").addEventListener("submit", (event) => {
    event.preventDefault();
    showNotification("Filters applied", "info");
});
