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

    // Wait for the navbar to be fully loaded
    function initializeNavbar() {
        const hamburger = document.getElementById('hamburger-button');
        const mobileNav = document.getElementById('mobile-nav-links');
        const menuWrapper = document.getElementById('mobile-menu-wrapper');
        
        if (!hamburger || !mobileNav || !menuWrapper) {
            // If elements aren't ready yet, try again in a few milliseconds
            setTimeout(initializeNavbar, 50);
            return;
        }

        let isMenuOpen = false;

        // Toggle menu on hamburger click
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                mobileNav.style.display = 'flex';
                menuWrapper.classList.add('menu-open');
                hamburger.classList.add('open');
            } else {
                mobileNav.style.display = 'none';
                menuWrapper.classList.remove('menu-open');
                hamburger.classList.remove('open');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuWrapper.contains(e.target) && isMenuOpen) {
                isMenuOpen = false;
                mobileNav.style.display = 'none';
                menuWrapper.classList.remove('menu-open');
                hamburger.classList.remove('open');
            }
        });

        // Close menu when clicking on a nav link
        const navLinks = mobileNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                isMenuOpen = false;
                mobileNav.style.display = 'none';
                menuWrapper.classList.remove('menu-open');
                hamburger.classList.remove('open');
            });
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                // Reset mobile menu state on desktop
                isMenuOpen = false;
                mobileNav.style.display = '';
                menuWrapper.classList.remove('menu-open');
                hamburger.classList.remove('open');
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNavbar);
    } else {
        initializeNavbar();
    }
