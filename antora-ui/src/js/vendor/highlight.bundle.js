;(function () {
  'use strict'

  var hljs = require('highlight.js/lib/common')

  // Only register languages not included in common bundle
  hljs.registerLanguage('cmake', require('highlight.js/lib/languages/cmake'))

  hljs.highlightAll()

  window.hljs = hljs
})()
