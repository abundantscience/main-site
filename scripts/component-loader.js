function loadComponent(targetId, filePath) {
    fetch(filePath)
        .then(res => res.text())
        .then(html => {
            document.getElementById(targetId).innerHTML = html;
        })
        .catch(err => console.error(`Error loading ${filePath}:`, err));
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("nav-placeholder")) {
        loadComponent("nav-placeholder", "components/navbar.html");
    }
    if (document.getElementById("footer-placeholder")) {
        loadComponent("footer-placeholder", "components/footer.html");
    }
});
