document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const pageName = link.dataset.page;
    try {
      const res = await fetch(`/pages/${pageName}`);
      const html = await res.text();
      document.getElementById("content").innerHTML = html;
    } catch (err) {
      document.getElementById("content").innerHTML = "<p>تعذر تحميل الصفحة</p>";
    }
  });
});




