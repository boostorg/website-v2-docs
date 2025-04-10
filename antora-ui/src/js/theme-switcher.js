;(function () {
  'use strict'

  // Theme options
  const THEMES = {
    github: {
      name: 'GitHub (Default)',
      stylesheet: 'highlight.css',
    },
    oneLight: {
      name: 'One Light',
      stylesheet: 'highlight-one-light.css',
    },
    oneDark: {
      name: 'One Dark',
      stylesheet: 'highlight-onedark.css',
    },
  }

  // Default theme
  const DEFAULT_THEME = 'github'
  // Storage key for theme preference
  const STORAGE_KEY = 'preferred-highlight-theme'

  function getCurrentTheme () {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
  }

  function setTheme (themeName) {
    if (!THEMES[themeName]) return

    const head = document.querySelector('head')
    let themeLink = document.getElementById('highlight-theme')
    const defaultLink = document.getElementById('highlight-default')

    if (!themeLink) {
      // Create the theme link if it doesn't exist
      themeLink = document.createElement('link')
      themeLink.id = 'highlight-theme'
      themeLink.rel = 'stylesheet'
      head.appendChild(themeLink)
    }

    // Set the theme
    themeLink.href = `${window.uiRootPath || '.'}/css/${THEMES[themeName].stylesheet}`

    // Enable/disable the default theme as needed
    if (themeName === 'github') {
      // For GitHub theme, enable the default link and disable our custom theme
      if (defaultLink) defaultLink.disabled = false
      if (themeLink) themeLink.disabled = true
    } else {
      // For custom themes, disable the default link and enable our custom theme
      if (defaultLink) defaultLink.disabled = true
      if (themeLink) themeLink.disabled = false
    }

    window.localStorage.setItem(STORAGE_KEY, themeName)

    // Update theme toggle button if it exists
    const themeSwitcher = document.getElementById('theme-selector')
    if (themeSwitcher) {
      themeSwitcher.value = themeName
    }
  }

  function createThemeSelector () {
    const nav = document.querySelector('.navbar-end')
    if (!nav) return

    const container = document.createElement('div')
    container.className = 'navbar-item'

    const label = document.createElement('span')
    label.className = 'theme-label'
    label.textContent = 'Code Theme: '
    label.style.marginRight = '0.5rem'

    const select = document.createElement('select')
    select.id = 'theme-selector'
    select.setAttribute('aria-label', 'Select syntax highlighting theme')

    Object.keys(THEMES).forEach((themeKey) => {
      const option = document.createElement('option')
      option.value = themeKey
      option.textContent = THEMES[themeKey].name
      select.appendChild(option)
    })

    select.value = getCurrentTheme()

    select.addEventListener('change', function () {
      setTheme(this.value)
    })

    container.appendChild(label)
    container.appendChild(select)
    nav.appendChild(container)
  }

  // Initialize theme
  document.addEventListener('DOMContentLoaded', function () {
    // Get uiRootPath from the site-script element
    const siteScript = document.getElementById('site-script')
    if (siteScript) {
      window.uiRootPath = siteScript.dataset.uiRootPath
    }

    // Apply current theme
    setTheme(getCurrentTheme())

    // Create theme selector UI
    createThemeSelector()
  })
})()
