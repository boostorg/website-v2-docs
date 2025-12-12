;(function () {
  'use strict'

  var hljs = require('highlight.js/lib/common')
  var CppHighlight = require('./cpp-highlight')

  // Only register languages not included in common bundle
  hljs.registerLanguage('cmake', require('highlight.js/lib/languages/cmake'))

  // Replace C++ highlighting AFTER highlight.js processes blocks
  // Let hljs work initially, then replace C++ blocks with custom highlighter
  function processCppBlocks () {
    // Selectors for C++ code blocks that highlight.js has already processed
    var cppSelectors = [
      'code.language-cpp.hljs',
      'code.language-c++.hljs',
      'code[data-lang="cpp"].hljs',
      'code[data-lang="c++"].hljs',
      '.doc pre.highlight code[data-lang="cpp"].hljs',
      '.doc pre.highlight code[data-lang="c++"].hljs',
    ]

    var processedCount = 0

    cppSelectors.forEach(function (selector) {
      try {
        document.querySelectorAll(selector).forEach(function (el) {
          // Skip if already processed
          if (el.classList.contains('cpp-highlight')) return

          // Replace highlight.js's C++ highlighting with our custom highlighter
          // This gives us full control over C++ syntax highlighting
          CppHighlight.highlightElement(el)

          // Mark as processed with our custom highlighter
          el.classList.add('cpp-highlight')
          processedCount++
        })
      } catch (e) {
        console.warn('cpp-highlight error:', selector, e)
      }
    })

    if (processedCount > 0) {
      console.log('cpp-highlight: Replaced ' + processedCount + ' C++ code blocks')
    }
  }

  // Process C++ blocks after highlight.js runs
  function initHighlighting () {
    // First, let highlight.js process everything
    hljs.highlightAll()

    // Then, replace C++ blocks with our custom highlighter
    // Use setTimeout to ensure highlight.js is completely done
    setTimeout(function () {
      processCppBlocks()
    }, 0)
  }

  // Process when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHighlighting)
  } else {
    // DOM already loaded
    initHighlighting()
  }

  // Also use MutationObserver to catch dynamically added content
  // Process C++ blocks after highlight.js processes new content
  if (typeof window.MutationObserver !== 'undefined') {
    var observer = new window.MutationObserver(function (mutations) {
      var shouldProcess = false
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length > 0) {
          shouldProcess = true
        }
      })
      if (shouldProcess) {
        // Wait a bit for highlight.js to process new content
        setTimeout(function () {
          processCppBlocks()
        }, 100)
      }
    })
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    })
  }

  window.hljs = hljs
})()
