/* ==========================================================================
   PORTFOLIO JAVASCRIPT - BISHNU PRASAD SAHU
   Theme Controller & Interactive UI
   ========================================================================== */

// 1. Immediate Theme Initialization (prevents flash of wrong theme)
(() => {
    try {
        const savedTheme = localStorage.getItem("portfolio-theme");
        // Default to dark mode unless explicitly saved as light
        const isDark = savedTheme !== null ? savedTheme === "dark" : true;
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    } catch (e) {
        document.documentElement.classList.add("dark");
    }
})();

// 2. Preloader Controller
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    const bar = preloader && preloader.querySelector(".preloader-bar");

    if (!preloader) return;

    // Lock scroll
    document.body.classList.add("is-loading");

    const DURATION = 1000; // 3 seconds exactly

    // Smoothly animate the progress bar
    const startTime = performance.now();

    function animateBar(now) {
        const elapsed = now - startTime;
        const progress = Math.min((elapsed / DURATION) * 100, 100);
        if (bar) bar.style.width = progress + "%";
        if (progress < 100) {
            requestAnimationFrame(animateBar);
        }
    }
    requestAnimationFrame(animateBar);

    // Dismiss after exactly 3 seconds
    function dismissPreloader() {
        if (bar) bar.style.width = "100%";

        // Short delay so bar hits 100% visually before fade
        setTimeout(() => {
            preloader.classList.add("is-hidden");
            document.body.classList.remove("is-loading");

            // Remove from DOM after CSS fade transition (0.7s)
            setTimeout(() => {
                if (preloader.parentNode) preloader.remove();
            }, 750);
        }, 80);
    }

    setTimeout(dismissPreloader, DURATION);
});




// 3. Interactive Features & Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // Theme Switcher Manager
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const themeIcon = document.getElementById("theme-icon");

    const updateThemeUI = (isDark) => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add("dark");
            if (themeIcon) themeIcon.textContent = "light_mode";
            if (themeToggleBtn) {
                themeToggleBtn.setAttribute("title", "Switch to Light Mode");
                themeToggleBtn.setAttribute("aria-label", "Switch to Light Mode");
            }
        } else {
            html.classList.remove("dark");
            if (themeIcon) themeIcon.textContent = "dark_mode";
            if (themeToggleBtn) {
                themeToggleBtn.setAttribute("title", "Switch to Dark Mode");
                themeToggleBtn.setAttribute("aria-label", "Switch to Dark Mode");
            }
        }
    };

    // Synchronize initial UI state
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    updateThemeUI(isCurrentlyDark);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const isDark = document.documentElement.classList.contains("dark");
            const newIsDark = !isDark;
            updateThemeUI(newIsDark);
            try {
                localStorage.setItem("portfolio-theme", newIsDark ? "dark" : "light");
            } catch (err) {
                console.warn("localStorage not available:", err);
            }
        });
    }

    // ----------------------------------------------------------------------
    // Mobile Navigation Drawer Toggle
    // ----------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuIcon = document.getElementById("mobile-menu-icon");

    if (mobileMenuBtn && mobileMenu) {
        const toggleMobileMenu = () => {
            const isOpen = mobileMenu.classList.contains("is-open");
            if (isOpen) {
                mobileMenu.classList.remove("is-open");
                if (mobileMenuIcon) mobileMenuIcon.textContent = "menu";
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            } else {
                mobileMenu.classList.add("is-open");
                if (mobileMenuIcon) mobileMenuIcon.textContent = "close";
                mobileMenuBtn.setAttribute("aria-expanded", "true");
            }
        };

        const closeMobileMenu = () => {
            if (mobileMenu.classList.contains("is-open")) {
                mobileMenu.classList.remove("is-open");
                if (mobileMenuIcon) mobileMenuIcon.textContent = "menu";
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            }
        };

        mobileMenuBtn.addEventListener("click", toggleMobileMenu);

        // Close mobile drawer when clicking a navigation link
        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                closeMobileMenu();
            });
        });

        // Close on Escape key press
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeMobileMenu();
            }
        });

        // Close on window resize if scaled above mobile breakpoint
        window.addEventListener("resize", () => {
            if (window.innerWidth >= 1024) {
                closeMobileMenu();
            }
        });
    }

    // ----------------------------------------------------------------------
    // Scroll Spy & Smooth Navigation
    // ----------------------------------------------------------------------
    const desktopNavLinks = document.querySelectorAll(".desktop-nav .nav-link");
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-list .mobile-nav-link");
    const allNavLinks = [...desktopNavLinks, ...mobileNavLinks];
    const header = document.querySelector(".site-header");

    // Sections tracked by the navbar
    const sectionIds = ["hero", "about", "experience", "internships", "formula", "skills", "certifications", "contact"];
    const sections = sectionIds
        .map(id => document.getElementById(id))
        .filter(el => el !== null);

    let isManualScrolling = false;
    let manualScrollTimeout = null;

    // Function to set the active link across desktop and mobile nav
    function setActiveNavLink(targetId) {
        if (!targetId) return;
        const cleanId = targetId.replace(/^#/, "");

        allNavLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href && href.replace(/^#/, "") === cleanId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    // Determine the active section based on current scroll position
    function getActiveSectionId() {
        const scrollY = window.scrollY || window.pageYOffset;
        const headerHeight = header ? header.offsetHeight : 70;
        const triggerLine = headerHeight + 60; // Point just below the navbar

        // Top of page check
        if (scrollY < 100) {
            return "hero";
        }

        // Bottom of page check (ensures contact is active when scrolled to bottom)
        const scrollBottom = window.innerHeight + scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        if (scrollBottom >= pageHeight - 40) {
            return "contact";
        }

        // Check sections in reverse order (bottom to top)
        for (let i = sections.length - 1; i >= 0; i--) {
            const sec = sections[i];
            const rect = sec.getBoundingClientRect();
            // If the top of the section has reached or crossed the trigger line
            if (rect.top <= triggerLine) {
                return sec.id;
            }
        }

        return "hero";
    }

    let isTicking = false;
    function updateScrollSpy() {
        if (isManualScrolling) return;

        const currentActiveId = getActiveSectionId();
        setActiveNavLink(currentActiveId);
    }

    function onScroll() {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateScrollSpy();
                isTicking = false;
            });
            isTicking = true;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollSpy, { passive: true });

    // Initial check on load
    setActiveNavLink("hero");
    updateScrollSpy();

    // ----------------------------------------------------------------------
    // Smooth Scrolling with Fixed Navbar Offset
    // ----------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetHref = this.getAttribute("href");
            if (!targetHref) return;

            if (targetHref === "#" || targetHref === "#hero") {
                e.preventDefault();
                isManualScrolling = true;
                clearTimeout(manualScrollTimeout);
                setActiveNavLink("hero");

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                manualScrollTimeout = setTimeout(() => {
                    isManualScrolling = false;
                    updateScrollSpy();
                }, 800);
                return;
            }

            const targetElement = document.querySelector(targetHref);
            if (targetElement) {
                e.preventDefault();
                const targetId = targetHref.replace(/^#/, "");

                // Immediately activate the clicked navbar item
                setActiveNavLink(targetId);

                // Lock scroll spy while smooth scrolling
                isManualScrolling = true;
                clearTimeout(manualScrollTimeout);

                const headerHeight = header ? header.offsetHeight : 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: "smooth"
                });

                manualScrollTimeout = setTimeout(() => {
                    isManualScrolling = false;
                    updateScrollSpy();
                }, 800);
            }
        });
    });
});
