import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Completely suppress ResizeObserver errors (known harmless UI library issue)
const resizeObserverErr = /ResizeObserver loop/;

// Override console.error
const originalConsoleError = console.error;
console.error = function(...args) {
  if (args[0] && typeof args[0] === 'string' && resizeObserverErr.test(args[0])) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Suppress at window level
window.addEventListener('error', function(e) {
  if (resizeObserverErr.test(e.message)) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
}, true);

// Also catch unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
  if (e.reason && e.reason.message && resizeObserverErr.test(e.reason.message)) {
    e.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
