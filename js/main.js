/**
 * Main JavaScript for Code-Alongside website
 * Contains mobile menu toggle with focus trap and year update functionality
 * WCAG 2.1 AA compliant
 */

// Mobile menu toggle with focus trap
const menuToggle = document.querySelector('.header__menu-toggle');
const mainNav = document.querySelector('.header__nav');
const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let focusableContent = null;
let firstFocusable = null;
let lastFocusable = null;

/**
 * Opens the mobile menu and sets up focus trap
 */
function openMenu() {
    mainNav.classList.add('is-open');
    mainNav.removeAttribute('inert');
    mainNav.removeAttribute('aria-hidden');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Menü schließen');

    // Get all focusable elements in the menu
    focusableContent = mainNav.querySelectorAll(focusableElements);
    firstFocusable = focusableContent[0];
    lastFocusable = focusableContent[focusableContent.length - 1];

    // Focus the first menu item
    if (firstFocusable) {
        firstFocusable.focus();
    }
}

/**
 * Closes the mobile menu and removes focus trap
 */
function closeMenu() {
    mainNav.classList.remove('is-open');
    mainNav.setAttribute('inert', '');
    mainNav.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Menü öffnen');

    // Return focus to the menu toggle
    menuToggle.focus();
}

/**
 * Traps focus within the mobile menu when open
 * @param {KeyboardEvent} e - The keyboard event
 */
function trapFocus(e) {
    if (!mainNav.classList.contains('is-open') || !focusableContent?.length) return;

    const isTabPressed = e.key === 'Tab';
    const isEscapePressed = e.key === 'Escape';

    // Close menu on Escape
    if (isEscapePressed) {
        closeMenu();
        return;
    }

    if (!isTabPressed) return;

    // Shift + Tab
    if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
        }
    }
    // Tab
    else {
        if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        }
    }
}

if (menuToggle && mainNav) {
    // Check if we're on desktop (1024px+) where nav is always visible
    const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

    // Initialize menu as closed with inert attribute ONLY on mobile
    if (!isDesktop()) {
        mainNav.setAttribute('inert', '');
        mainNav.setAttribute('aria-hidden', 'true');
    }

    // Toggle menu on button click
    menuToggle.addEventListener('click', function () {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Add focus trap listener
    document.addEventListener('keydown', trapFocus);

    // Close menu when clicking a link (mobile only)
    mainNav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            if (!isDesktop()) {
                closeMenu();
            }
        });
    });

    // Handle viewport resize - manage inert attribute
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
        if (e.matches) {
            // Desktop: remove inert to make nav clickable
            mainNav.removeAttribute('inert');
            mainNav.removeAttribute('aria-hidden');
        } else {
            // Mobile: close menu and re-add inert
            if (!mainNav.classList.contains('is-open')) {
                mainNav.setAttribute('inert', '');
                mainNav.setAttribute('aria-hidden', 'true');
            }
        }
    });
}

// Update current year
const yearElement = document.getElementById('current-year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}
