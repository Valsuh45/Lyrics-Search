import { LyricsSearchApp } from "./app";
import { StorageManager } from "./storage";

// Apply theme immediately to prevent flickering
const getCurrentTheme = (): string => {
  return localStorage.getItem("lyrics-search-theme") || "light";
};

const applyThemeImmediate = (theme: string) => {
  document.documentElement.setAttribute("data-theme", theme);
};

// Apply saved theme immediately
applyThemeImmediate(getCurrentTheme());

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize storage manager
    const storageManager = new StorageManager();

    // Initialize the main application
    const app = new LyricsSearchApp();

    // Make app and storage globally available for debugging
    (window as any).__lyricsApp = app;
    (window as any).StorageManager = StorageManager;
    (window as any).__storageManager = storageManager;

    // Add keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById(
          "search-input",
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Clear search on Escape
      if (e.key === "Escape") {
        const searchInput = document.getElementById(
          "search-input",
        ) as HTMLInputElement;
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
        }
      }
    });

    // Theme management
    const updateThemeIcon = (theme: string) => {
      const themeIcon = document.querySelector(".theme-icon");
      if (themeIcon) {
        themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
      }
    };

    const applyTheme = (theme: string) => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("lyrics-search-theme", theme);
      updateThemeIcon(theme);
    };

    const toggleTheme = () => {
      const currentTheme = getCurrentTheme();
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
    };

    // Apply saved theme on load
    applyTheme(getCurrentTheme());

    // Theme toggle button event listener
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    // Handle offline/online status
    const updateOnlineStatus = () => {
      if (!navigator.onLine) {
        document.body.classList.add("offline");
        showOfflineNotification();
      } else {
        document.body.classList.remove("offline");
        hideOfflineNotification();
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    // Performance monitoring
    if ("performance" in window) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming;
          console.log(
            "Page load time:",
            perfData.loadEventEnd - perfData.loadEventStart,
            "ms",
          );
        }, 0);
      });
    }

    console.log("🎵 LyricsSearch app initialized successfully");
  } catch (error) {
    console.error("Failed to initialize LyricsSearch app:", error);
    showFallbackInterface();
  }
});

// Offline notification functions
function showOfflineNotification() {
  const existingNotification = document.querySelector(".offline-notification");
  if (existingNotification) return;

  const notification = document.createElement("div");
  notification.className = "offline-notification";
  notification.innerHTML = `
    <div class="notification-content">
      <i class="icon-offline">📶</i>
      <span>You're offline. Some features may not work.</span>
    </div>
  `;

  document.body.appendChild(notification);
}

function hideOfflineNotification() {
  const notification = document.querySelector(".offline-notification");
  if (notification) {
    notification.remove();
  }
}

// Fallback interface for critical errors
function showFallbackInterface() {
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      text-align: center;
      font-family: system-ui, sans-serif;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;">
        ⚠️ Something went wrong
      </h1>
      <p style="margin-bottom: 2rem; color: #6b7280;">
        The application failed to load properly. Please refresh the page or try again later.
      </p>
      <button onclick="window.location.reload()" style="
        padding: 0.75rem 1.5rem;
        background: #8b5cf6;
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 1rem;
      ">
        Refresh Page
      </button>
    </div>
  `;
}

// Global error handling
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
});

// Add CSS for offline notification
const offlineStyles = `
  .offline-notification {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: #f59e0b;
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideInFromRight 0.3s ease-out;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .offline {
    filter: grayscale(0.5);
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = offlineStyles;
document.head.appendChild(styleSheet);
