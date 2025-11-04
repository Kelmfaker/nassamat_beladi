// Admin Dashboard JS (externalized)
document.addEventListener('DOMContentLoaded', function () {
  console.log('admin-dashboard.js loaded');

  // If server injected chartData for Chart.js, initialize small charts
  try {
    // Wait for Chart.js and DOM to be ready, then initialize charts if server provided data.
    if (window.adminChartData && typeof Chart !== 'undefined') {
      const { labels, ordersData, revenueData } = window.adminChartData;

      function friendlyLabels(labelsArr) {
        return labelsArr.map(l => new Date(l).toLocaleDateString('ar-EG-u-nu-latn', { day: '2-digit', month: 'short' }));
      }

      // Orders (bar)
      const ordersEl = document.getElementById('ordersChart');
      if (ordersEl && labels && labels.length) {
        new Chart(ordersEl.getContext('2d'), {
          type: 'bar',
          data: { labels: friendlyLabels(labels), datasets: [{ label: 'الطلبات', data: ordersData, backgroundColor: 'rgba(13,132,66,0.8)' }] },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      // Revenue (line)
      const revenueEl = document.getElementById('revenueChart');
      if (revenueEl && labels && labels.length) {
        new Chart(revenueEl.getContext('2d'), {
          type: 'line',
          data: { labels: friendlyLabels(labels), datasets: [{ label: 'الإيرادات', data: revenueData, backgroundColor: 'rgba(209,203,41,0.2)', borderColor: 'rgba(209,203,41,1)', fill: true }] },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  } catch (err) {
    console.warn('Could not initialize admin charts', err);
  }
});
