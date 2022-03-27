// FIXME: Disabling until I figure out how to support both auto and manual theme switching.
if (false) {
document.addEventListener('DOMContentLoaded', onContentLoaded);
const THEME_OPTIONS = ["light", "dark", "auto"]
let THEME_INDEX = 0

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const button = document.querySelector('.theme-toggle');
    if (button) {
        document.querySelector('#theme-button').innerHTML = theme;
    }
    document.cookie = "background=" + theme
}

function onContentLoaded() {
    // Select our toggle button
    const button = document.querySelector('.theme-toggle');

    // Add an event listener for a click
    button.addEventListener("click", (e) => {
        setTheme(THEME_OPTIONS[THEME_INDEX])
        THEME_INDEX++;
        if (THEME_INDEX === THEME_OPTIONS.length) {
            THEME_INDEX = 0
        }
    });

    if (document.cookie === "") {
        document.cookie = "background=light"
    }
    else {
        const cmps = document.cookie.split("=")
        setTheme(cmps[1])
    }
}
}
