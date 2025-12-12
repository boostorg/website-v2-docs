/**
 * cpp-highlight.js - Lightweight C++ syntax highlighter
 *
 * Categories:
 *   - keyword     : Language keywords (const, while, if, etc.)
 *   - literal     : String, character, and numeric literals
 *   - preprocessor: Preprocessor directives (#include, #define, etc.)
 *   - comment     : C and C++ style comments
 *   - attribute   : C++ attributes ([[nodiscard]], etc.)
 */

const CppHighlight = (function () {
  'use strict'

  const KEYWORDS = new Set([
    // Storage class
    'auto', 'register', 'static', 'extern', 'mutable', 'thread_local',
    // Type qualifiers
    'const', 'volatile', 'constexpr', 'consteval', 'constinit',
    // Type specifiers
    'void', 'bool', 'char', 'short', 'int', 'long', 'float', 'double',
    'signed', 'unsigned', 'wchar_t', 'char8_t', 'char16_t', 'char32_t',
    // Complex types
    'class', 'struct', 'union', 'enum', 'typename', 'typedef',
    // Control flow
    'if', 'else', 'switch', 'case', 'default', 'for', 'while', 'do',
    'break', 'continue', 'return', 'goto',
    // Exception handling
    'try', 'catch', 'throw', 'noexcept',
    // OOP
    'public', 'private', 'protected', 'virtual', 'override', 'final',
    'friend', 'this', 'operator', 'new', 'delete',
    // Templates
    'template', 'concept', 'requires',
    // Namespace
    'namespace', 'using',
    // Other
    'sizeof', 'alignof', 'alignas', 'decltype', 'typeid',
    'static_cast', 'dynamic_cast', 'const_cast', 'reinterpret_cast',
    'static_assert', 'inline', 'explicit', 'export', 'module', 'import',
    'co_await', 'co_yield', 'co_return',
    // Literals
    'true', 'false', 'nullptr', 'NULL',
  ])

  const NUMBER = /^(?:0[xX][0-9a-fA-F']+|0[bB][01']+|0[0-7']*|[1-9][0-9']*(?:\.[0-9']*)?(?:[eE][+-]?[0-9]+)?)[uUlLfF]*/

  function escapeHtml (text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function span (cls, content) {
    return `<span class="cpp-${cls}">${escapeHtml(content)}</span>`
  }

  function highlight (code) {
    const result = []
    let i = 0
    const n = code.length

    while (i < n) {
      // Whitespace
      if (/\s/.test(code[i])) {
        const start = i
        while (i < n && /\s/.test(code[i])) i++
        result.push(code.slice(start, i))
        continue
      }

      // C++ attributes [[...]]
      if (code.slice(i, i + 2) === '[[') {
        const start = i
        i += 2
        let depth = 1
        while (i < n && depth > 0) {
          if (code.slice(i, i + 2) === '[[') {
            depth++
            i += 2
          } else if (code.slice(i, i + 2) === ']]') {
            depth--
            i += 2
          } else {
            i++
          }
        }
        result.push(span('attribute', code.slice(start, i)))
        continue
      }

      // Line comment
      if (code[i] === '/' && code[i + 1] === '/') {
        let end = i + 2
        while (end < n && code[end] !== '\n') end++
        result.push(span('comment', code.slice(i, end)))
        i = end
        continue
      }

      // Block comment
      if (code[i] === '/' && code[i + 1] === '*') {
        let end = i + 2
        while (end < n - 1 && !(code[end] === '*' && code[end + 1] === '/')) end++
        end += 2
        result.push(span('comment', code.slice(i, end)))
        i = end
        continue
      }

      // Preprocessor directive (at start of line or after whitespace)
      if (code[i] === '#') {
        let checkPos = i - 1
        while (checkPos >= 0 && (code[checkPos] === ' ' || code[checkPos] === '\t')) checkPos--
        if (checkPos < 0 || code[checkPos] === '\n') {
          let end = i + 1
          while (end < n) {
            if (code[end] === '\n') {
              if (code[end - 1] === '\\') {
                end++
                continue
              }
              break
            }
            end++
          }
          result.push(span('preprocessor', code.slice(i, end)))
          i = end
          continue
        }
      }

      // Raw string literal R"delimiter(...)delimiter"
      if (code[i] === 'R' && code[i + 1] === '"') {
        let delimEnd = i + 2
        while (delimEnd < n && code[delimEnd] !== '(') delimEnd++
        const delimiter = code.slice(i + 2, delimEnd)
        const endMarker = ')' + delimiter + '"'
        let end = delimEnd + 1
        while (end < n) {
          if (code.slice(end, end + endMarker.length) === endMarker) {
            end += endMarker.length
            break
          }
          end++
        }
        result.push(span('literal', code.slice(i, end)))
        i = end
        continue
      }

      // String literal (with optional prefix)
      if (code[i] === '"' ||
        ((code[i] === 'L' || code[i] === 'u' || code[i] === 'U') && code[i + 1] === '"') ||
        (code[i] === 'u' && code[i + 1] === '8' && code[i + 2] === '"')) {
        const start = i
        if (code[i] === 'u' && code[i + 1] === '8') i += 2
        else if (code[i] !== '"') i++
        i++
        while (i < n && code[i] !== '"') {
          if (code[i] === '\\' && i + 1 < n) i += 2
          else i++
        }
        i++
        result.push(span('literal', code.slice(start, i)))
        continue
      }

      // Character literal
      if (code[i] === '\'' ||
        ((code[i] === 'L' || code[i] === 'u' || code[i] === 'U') && code[i + 1] === '\'') ||
        (code[i] === 'u' && code[i + 1] === '8' && code[i + 2] === '\'')) {
        const start = i
        if (code[i] === 'u' && code[i + 1] === '8') i += 2
        else if (code[i] !== '\'') i++
        i++
        while (i < n && code[i] !== '\'') {
          if (code[i] === '\\' && i + 1 < n) i += 2
          else i++
        }
        i++
        result.push(span('literal', code.slice(start, i)))
        continue
      }

      // Number literals
      const numMatch = code.slice(i).match(NUMBER)
      if (numMatch && (i === 0 || !/[a-zA-Z_]/.test(code[i - 1]))) {
        result.push(span('literal', numMatch[0]))
        i += numMatch[0].length
        continue
      }

      // Identifier or keyword
      if (/[a-zA-Z_]/.test(code[i])) {
        let end = i + 1
        while (end < n && /[a-zA-Z0-9_]/.test(code[end])) end++
        const word = code.slice(i, end)
        if (KEYWORDS.has(word)) {
          result.push(span('keyword', word))
        } else {
          result.push(escapeHtml(word))
        }
        i = end
        continue
      }

      // Default: single character
      result.push(escapeHtml(code[i]))
      i++
    }

    return result.join('')
  }

  function highlightElement (el) {
    el.innerHTML = highlight(el.textContent)
  }

  function highlightAll (selector = 'code.cpp, code.c++, pre.cpp, pre.c++') {
    document.querySelectorAll(selector).forEach(highlightElement)
  }

  return {
    highlight,
    highlightElement,
    highlightAll,
    KEYWORDS,
  }
})()

// CommonJS / ES module support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CppHighlight
}
