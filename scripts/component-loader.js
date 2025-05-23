function loadComponent(targetId, filePath) {
    fetch(filePath)
        .then(res => res.text())
        .then(html => {
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = html;
            }
        })
        .catch(err => console.error(`Error loading ${filePath}:`, err));
}

document.addEventListener("DOMContentLoaded", () => {
    const components = [
        { id: "header-placeholder", path: "components/header.html" },
        { id: "nav-placeholder", path: "components/navbar.html" },
        { id: "footer-placeholder", path: "components/footer.html" }
    ];

    components.forEach(({ id, path }) => loadComponent(id, path));
});
