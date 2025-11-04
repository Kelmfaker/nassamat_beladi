// Products page JS (externalized)
document.addEventListener('DOMContentLoaded', function () {
  console.log('products.js loaded');

  // Simple behavior: lazy attach add-to-cart handlers for elements with data-add-to-cart
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-add-to-cart');
      // trigger existing addToCart function if present
      if (typeof addToCart === 'function') {
        addToCart(id);
      }
    });
  });
});
