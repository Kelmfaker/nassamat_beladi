// Admin products JS (externalized)
document.addEventListener('DOMContentLoaded', function () {
  console.log('admin-products.js loaded');

  // Attach AJAX handlers for forms that have data-ajax="true"
  document.querySelectorAll('form[data-ajax="true"]').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const url = form.action;
      const method = (form.method || 'POST').toUpperCase();
      const formData = new FormData(form);

      fetch(url, { method, body: formData, headers: { 'Accept': 'application/json' } })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            // simple reload for now
            location.reload();
          } else {
            alert(data.message || 'Request failed');
          }
        }).catch(err => {
          console.error('AJAX error', err);
          alert('Network error');
        });
    });
  });
});
