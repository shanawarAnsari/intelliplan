/**
 * Accessibility utilities for keyboard navigation and focus management
 */

/**
 * Generate unique ID for ARIA attributes
 */
export const generateId = (prefix = "element") => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Handle keyboard navigation for lists
 */
export const handleListKeyDown = (event, onSelect) => {
  switch (event.key) {
    case "ArrowDown":
    case "ArrowUp":
    case "Home":
    case "End":
    case "Enter":
    case " ":
      event.preventDefault();
      onSelect?.(event);
      break;
    default:
      break;
  }
};

/**
 * Get accessible announcement text
 */
export const getAnnouncementText = (count, type) => {
  const pluralForm = count === 1 ? "" : "s";
  return `${count} ${type}${pluralForm}`;
};

/**
 * Create focus trap for modals
 */
export const createFocusTrap = (containerRef) => {
  const container = containerRef?.current;
  if (!container) return null;

  const focusableElements = container.querySelectorAll(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  return {
    handleKeyDown: (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    focusFirst: () => firstElement?.focus(),
    focusLast: () => lastElement?.focus(),
  };
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Check if user prefers high contrast
 */
export const prefersHighContrast = () => {
  return window.matchMedia("(prefers-contrast: more)").matches;
};

/**
 * Check if system is in dark mode
 */
export const prefersDarkMode = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
