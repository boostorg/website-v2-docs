;(function () {
  'use strict'

  // Skip theme toggle when embedded in an iframe (boost.org handles its own theme)
  if (window.self !== window.top) return

  var STORAGE_KEY = 'antora-theme'
  var DARK_CLASS = 'dark'
  var html = document.documentElement
  var storage = window.localStorage

  // Get the saved theme or detect system preference
  function getPreferredTheme () {
    var saved = storage.getItem(STORAGE_KEY)
    if (saved) return saved
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  // Apply theme to document
  function applyTheme (theme) {
    if (theme === 'dark') {
      html.classList.add(DARK_CLASS)
    } else {
      html.classList.remove(DARK_CLASS)
    }
  }

  // Save theme preference
  function saveTheme (theme) {
    storage.setItem(STORAGE_KEY, theme)
  }

  // Toggle between light and dark
  function toggleTheme () {
    var currentTheme = html.classList.contains(DARK_CLASS) ? 'dark' : 'light'
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    applyTheme(newTheme)
    saveTheme(newTheme)
  }

  // Initialize theme (in case head-scripts didn't run or for consistency)
  var initialTheme = getPreferredTheme()
  applyTheme(initialTheme)

  // Show the toggle button and set up click handler
  var toggleButton = document.querySelector('.theme-toggle')
  if (toggleButton) {
    toggleButton.style.display = 'inline-flex'
    toggleButton.addEventListener('click', toggleTheme)
  }

  // Listen for system preference changes
  if (window.matchMedia) {
    var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    var handleChange = function (e) {
      // Only auto-switch if user hasn't set a preference
      if (!storage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }
  }
})()
