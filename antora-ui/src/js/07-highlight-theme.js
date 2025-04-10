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

  // Default theme - changed to onedark
  const DEFAULT_THEME = 'oneDark'
  // Storage key for theme preference
  const STORAGE_KEY = 'preferred-highlight-theme'

  function getCurrentTheme () {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME
  }

  function setTheme (themeName) {
    console.log('Setting theme to:', themeName)
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

    // Update buttons if they exist
    const container = document.getElementById('theme-selector-container')
    if (container) {
      container.querySelectorAll('button').forEach((btn) => {
        btn.style.background = btn.value === themeName ? '#007bff' : '#fff'
        btn.style.color = btn.value === themeName ? '#fff' : '#333'
      })
    }
  }

  // Keep the function but we won't call it
  // eslint-disable-next-line no-unused-vars
  function createThemeSelector () {
    console.log('Creating theme selector')

    // Create the theme selector element
    const container = document.createElement('div')
    container.id = 'theme-selector-container'
    container.style.display = 'flex'
    container.style.alignItems = 'center'
    container.style.padding = '12px'
    container.style.background = '#f8f8f8'
    container.style.borderBottom = '1px solid #ddd'
    container.style.zIndex = '100'
    container.style.position = 'sticky'
    container.style.top = '0'
    container.style.width = '100%'
    container.style.justifyContent = 'center'

    const label = document.createElement('span')
    label.textContent = 'Syntax Theme: '
    label.style.marginRight = '1rem'
    label.style.fontWeight = 'bold'

    container.appendChild(label)

    // Create buttons for each theme instead of a dropdown
    Object.keys(THEMES).forEach((themeKey) => {
      const button = document.createElement('button')
      button.textContent = THEMES[themeKey].name
      button.value = themeKey
      button.style.margin = '0 5px'
      button.style.padding = '5px 10px'
      button.style.border = '1px solid #ccc'
      button.style.borderRadius = '4px'
      button.style.background = themeKey === getCurrentTheme() ? '#007bff' : '#fff'
      button.style.color = themeKey === getCurrentTheme() ? '#fff' : '#333'
      button.style.cursor = 'pointer'

      button.addEventListener('click', function () {
        // Update all button styles
        container.querySelectorAll('button').forEach((btn) => {
          btn.style.background = btn.value === themeKey ? '#007bff' : '#fff'
          btn.style.color = btn.value === themeKey ? '#fff' : '#333'
        })

        setTheme(themeKey)
      })

      container.appendChild(button)
    })

    // Insert at the top of the body for maximum visibility
    document.body.prepend(container)
    console.log('Theme selector added at top of page')
  }

  // Initialize theme
  document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM content loaded - initializing theme switcher')

    // Get uiRootPath from the site-script element
    const siteScript = document.getElementById('site-script')
    if (siteScript) {
      window.uiRootPath = siteScript.dataset.uiRootPath
    }

    // Apply current theme
    setTheme(DEFAULT_THEME)

    // Don't create the UI selector
    // createThemeSelector()
    createThemeSelector()
  })
})()
