document.addEventListener("DOMContentLoaded", () => {
    const scripts = document.querySelectorAll("script");
    for(const script of scripts) script.remove();
    document.currentScript?.remove();
});