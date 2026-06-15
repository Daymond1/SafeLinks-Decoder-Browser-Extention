const body = document.body;
const themeBtn = document.getElementById("themeBtn");
const safeLinkInput = document.getElementById("safeLinkInput");
const decodedUrlInput = document.getElementById("decodedUrl");
const toast = document.getElementById("toast");
const decodeBtn = document.getElementById("decodeBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const statusBadge = document.getElementById("statusBadge");

// Load theme
let currentTheme = localStorage.getItem("theme") || "light";
body.classList.add(currentTheme);
updateThemeIcon();

// Load cached inputs
safeLinkInput.value = localStorage.getItem("safeLink") || "";
decodedUrlInput.value = localStorage.getItem("decodedUrl") || "";
updateStatusBadge();

// Regex to identify SafeLinks from standard and sovereign clouds (US, DE, CN, etc.)
const SAFELINK_REGEX = /https?:\/\/(?:[a-z0-9\-]+\.)*safelinks\.protection\.(?:outlook\.(?:com|de|cn|us)|office365\.us)\S*/i;

// Theme Toggle
themeBtn.addEventListener("click", () => {
    if (currentTheme === "light") {
        currentTheme = "dark";
    } else {
        currentTheme = "light";
    }
    body.classList.remove("light", "dark");
    body.classList.add(currentTheme);
    localStorage.setItem("theme", currentTheme);
    updateThemeIcon();
});

// Auto-decode on input
safeLinkInput.addEventListener("input", () => {
    localStorage.setItem("safeLink", safeLinkInput.value);
    autoDecode();
});

// Decode Button
decodeBtn.addEventListener("click", () => {
    performDecode();
});

// Copy Button
copyBtn.addEventListener("click", () => {
    const decodedUrl = decodedUrlInput.value;
    if (decodedUrl && decodedUrl !== "Invalid SafeLink" && decodedUrl !== "No SafeLink found") {
        navigator.clipboard.writeText(decodedUrl).then(() => {
            showToast("Copied to clipboard! 📋");
        }).catch(() => {
            showToast("Failed to copy ❌");
        });
    } else {
        showToast("Nothing to copy! ⚠️");
    }
});

// Clear Button
clearBtn.addEventListener("click", () => {
    safeLinkInput.value = "";
    decodedUrlInput.value = "";
    localStorage.removeItem("safeLink");
    localStorage.removeItem("decodedUrl");
    updateStatusBadge();
    showToast("Cleared 🧹");
});

function autoDecode() {
    const safeLink = safeLinkInput.value;
    if (!safeLink.trim()) {
        decodedUrlInput.value = "";
        localStorage.removeItem("decodedUrl");
        updateStatusBadge();
        return;
    }
    
    const decoded = decodeSafeLink(safeLink);
    if (decoded) {
        decodedUrlInput.value = decoded;
        localStorage.setItem("decodedUrl", decoded);
    } else {
        decodedUrlInput.value = "No SafeLink found";
        localStorage.setItem("decodedUrl", "No SafeLink found");
    }
    updateStatusBadge();
}

function performDecode() {
    const safeLink = safeLinkInput.value;
    if (!safeLink.trim()) {
        showToast("Please enter a link first! 🔗");
        return;
    }
    
    const decoded = decodeSafeLink(safeLink);
    if (decoded) {
        decodedUrlInput.value = decoded;
        localStorage.setItem("decodedUrl", decoded);
        showToast("Decoded successfully! ✨");
    } else {
        decodedUrlInput.value = "No SafeLink found";
        localStorage.setItem("decodedUrl", "No SafeLink found");
        showToast("No SafeLink patterns detected 🔍");
    }
    updateStatusBadge();
}

function decodeSafeLink(safeLink) {
    if (!safeLink) return null;
    const trimmedInput = safeLink.trim();
    
    // Look for a SafeLink pattern inside the text
    const match = trimmedInput.match(SAFELINK_REGEX);
    let targetUrl = trimmedInput;
    if (match) {
        targetUrl = match[0];
    }
    
    try {
        // Prepend protocol if missing for URL parsing
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = "https://" + targetUrl;
        }
        const url = new URL(targetUrl);
        
        // Standard SafeLinks parameter
        const encodedUrl = url.searchParams.get("url");
        if (encodedUrl) {
            return decodeURIComponent(encodedUrl);
        }
        
        // Alternative parameters (just in case)
        const alternativeParams = ["destination", "q", "u"];
        for (const param of alternativeParams) {
            const val = url.searchParams.get(param);
            if (val) return decodeURIComponent(val);
        }
    } catch (e) {
        // Fallback: search for url=... or destination=... parameter in raw text if URL parsing fails
        const fallbackMatch = trimmedInput.match(/[?&](?:url|destination|u)=([^&]+)/i);
        if (fallbackMatch) {
            try {
                return decodeURIComponent(fallbackMatch[1]);
            } catch {}
        }
    }
    
    // If it's a valid URL but not a SafeLink, just return it
    try {
        const urlObj = new URL(trimmedInput.startsWith("http") ? trimmedInput : "https://" + trimmedInput);
        if (urlObj.hostname.includes(".") || urlObj.hostname === "localhost") {
            return trimmedInput;
        }
        return null;
    } catch {
        return null;
    }
}

function updateThemeIcon() {
    if (currentTheme === "light") {
        themeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
    } else {
        themeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
    }
}

function updateStatusBadge() {
    const val = decodedUrlInput.value;
    if (!val || val === "") {
        statusBadge.textContent = "Ready";
        statusBadge.className = "badge ready";
    } else if (val === "No SafeLink found" || val === "Invalid SafeLink") {
        statusBadge.textContent = "No SafeLink";
        statusBadge.className = "badge warn";
    } else {
        statusBadge.textContent = "Decoded";
        statusBadge.className = "badge success";
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    
    // Clear previous timeout if any
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }
    
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}