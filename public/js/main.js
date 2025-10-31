// Main JavaScript file for Thinker Honey

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
});

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let totalItems = 0;
  cart.forEach(item => {
    totalItems += item.quantity;
  });
  
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
  }
}

// Mobile menu toggle
const toggleButton = document.getElementById("menu-toggle");
const menu = document.getElementById("nav-links");

if (toggleButton && menu) {
  toggleButton.addEventListener("click", function (e) {
    e.stopPropagation();
    menu.classList.toggle("show");
  });
}

console.log('✅ Thinker Honey - Main JS Loaded');