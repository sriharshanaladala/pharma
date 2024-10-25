// Sample cart data (in a real application, this data would come from your server)
let cart = [];

// Function to load cart items from local storage
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
    displayCartItems();
    updateCartCount(); // Update the cart count
}

// Function to display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    cartItemsContainer.innerHTML = '';

    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>Price: ₹${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
                <button class="remove-btn" onclick="removeFromCart('${item.name}')">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    totalPriceElement.innerText = `₹${totalPrice}`;
}

// Function to remove an item from the cart
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount(); // Update cart count after removing an item
}

// Function to update the cart count
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count'); // Ensure this ID matches the HTML
    if (cartCountElement) {
        cartCountElement.innerText = `(${cart.length})`; // Update the cart count based on the number of items
    }
}
function goToCheckout() {
    // You can optionally check if the cart is empty before proceeding
    if (cart.length === 0) {
        alert("Your cart is empty! Please add items to the cart before checking out.");
        return;
    }

    // Redirect to the checkout page
    window.location.href = 'checkout.html';
}


// Initialize the cart on page load
loadCart();
