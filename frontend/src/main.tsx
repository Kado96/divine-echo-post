import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import './i18n';

// Masquer les erreurs "Could not establish connection" et "Receiving end does not exist" (extensions du navigateur)
window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || (typeof event.reason === 'string' ? event.reason : '');
    if (msg.includes('Could not establish connection') || msg.includes('Receiving end does not exist')) {
        event.preventDefault();
    }
});

window.onerror = (message) => {
    if (typeof message === 'string' && message.includes('Could not establish connection')) {
        return true;
    }
    return false;
};

createRoot(document.getElementById("root")!).render(<App />);
