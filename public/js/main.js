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
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!toggleBtn || !navLinks) return;

  const closeMenu = () => {
    navLinks.classList.remove('show');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willShow = !navLinks.classList.contains('show');
    navLinks.classList.toggle('show', willShow);
    toggleBtn.classList.toggle('active', willShow);
    toggleBtn.setAttribute('aria-expanded', String(willShow));
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close after clicking a link
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', closeMenu)
  );
});

console.log('✅ Thinker Honey - Main JS Loaded');