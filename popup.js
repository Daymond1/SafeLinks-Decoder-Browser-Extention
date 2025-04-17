const body = document.body;
const themeBtn = document.getElementById("themeBtn");
const safeLinkInput = document.getElementById("safeLinkInput");
const decodedUrlInput = document.getElementById("decodedUrl");

let currentTheme = localStorage.getItem("theme") || "light";
body.classList.add(currentTheme);
updateThemeSymbol();

safeLinkInput.value = localStorage.getItem("safeLink") || "";
decodedUrlInput.value = localStorage.getItem("decodedUrl") || "";

themeBtn.addEventListener("click", () => {
    if (currentTheme === "light") {
        currentTheme = "dark";
    } else {
        currentTheme = "light";
    }
    body.classList.remove("light", "dark");
    body.classList.add(currentTheme);
    localStorage.setItem("theme", currentTheme);
    updateThemeSymbol();
});

safeLinkInput.addEventListener("input", () => {
    localStorage.setItem("safeLink", safeLinkInput.value);
});

document.getElementById("decodeBtn").addEventListener("click", () => {
    const safeLink = safeLinkInput.value;
    const decoded = decodeSafeLink(safeLink);
    decodedUrlInput.value = decoded || "Invalid SafeLink";
    localStorage.setItem("decodedUrl", decodedUrlInput.value);
});

document.getElementById("copyBtn").addEventListener("click", () => {
    const decodedUrl = decodedUrlInput.value;
    if (decodedUrl) {
        navigator.clipboard.writeText(decodedUrl);
    }
});

document.getElementById("clearBtn").addEventListener("click", () => {
    safeLinkInput.value = "";
    decodedUrlInput.value = "";
    localStorage.removeItem("safeLink");
    localStorage.removeItem("decodedUrl");
});

function decodeSafeLink(safeLink) {
    try {
        const url = new URL(safeLink);
        const encodedUrl = url.searchParams.get("url");
        if (!encodedUrl) return null;
        return decodeURIComponent(encodedUrl);
    } catch {
        return null;
    }
}

function updateThemeSymbol() {
    themeBtn.textContent = currentTheme === "light" ? "\u{1F31E}" : "\u{1F31A}"; // SUN WITH FACE / WANING CRESCENT MOON
}