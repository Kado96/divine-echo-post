import { createRoot } from "react-dom/client";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/800.css";
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
