const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("visible");
  });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));

function showToast() {
  const t = document.getElementById("toast");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

function copyPs() {
  const cmd = document.getElementById("psCommand").innerText;
  navigator.clipboard.writeText(cmd).then(showToast);
}

document.getElementById("copyPsBtn")?.addEventListener("click", copyPs);
document.getElementById("copyCode")?.addEventListener("click", copyPs);
