document.addEventListener('DOMContentLoaded', onContentLoaded)
const ALIGNMENT_OPTIONS = ['left', 'center']
let ALIGNMENT_INDEX = 1
const THEME_OPTIONS = ['light', 'dark', 'auto']
let THEME_INDEX = 2

function setAlignment(alignment) {
    const button = document.querySelector('#alignment-button')
    button.innerHTML = alignment
    const site_body = document.querySelector('.site-body')
    site_body.style.margin = alignment === 'left' ? 0 : 'auto'
    document.cookie = 'alignment=' + alignment
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    const button = document.querySelector('#theme-button')
    button.innerHTML = theme
    document.cookie = 'background=' + theme
}

function initAlignment() {
    // Select our toggle button
    const button = document.querySelector('#alignment-button')

    // Add an event listener for a click
    button.addEventListener('click', (e) => {
        setAlignment(ALIGNMENT_OPTIONS[ALIGNMENT_INDEX])
        ALIGNMENT_INDEX++
        if (ALIGNMENT_INDEX === ALIGNMENT_OPTIONS.length) {
            ALIGNMENT_INDEX = 0
        }
    })

    if (document.cookie !== '') {
        const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith('alignment='))
            ?.split('=')[1]
        setAlignment(value)
    }
}

function initTheme() {
    // Select our toggle button
    const button = document.querySelector('#theme-button')

    // Add an event listener for a click
    button.addEventListener('click', (e) => {
        setTheme(THEME_OPTIONS[THEME_INDEX])
        THEME_INDEX++
        if (THEME_INDEX === THEME_OPTIONS.length) {
            THEME_INDEX = 0
        }
    })

    if (document.cookie !== '') {
        const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith('background='))
            ?.split('=')[1]
        setTheme(value)
    }
}

function onContentLoaded() {
    initAlignment()
    initTheme()

    if (document.cookie === '') {
        document.cookie =
            'alignment=center; background=auto; SameSite=strict; Secure'
    }
}
