/**
 * SOR7ED BUTTON — Partner Widget
 * Embed on any site: <script src="https://planetsorted.com/widget.js" data-tool="adhd-tax-calculator" async></script>
 *
 * Attributes:
 *   data-tool    — tool slug (default: "adhd-tax-calculator")
 *   data-label   — button label (default: "GET SOR7ED")
 *   data-position — "bottom-right" | "bottom-left" (default: "bottom-right")
 *
 * The widget is fully self-contained: no external dependencies, no cookies, no iframes.
 * Clicking the button opens the relevant tool page on planetsorted.com in a new tab.
 */
;(function () {
  'use strict'

  var BASE_URL = 'https://planetsorted.com'
  var FONT_URL = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'
  var BRAND_RED = '#C0392B'
  var BRAND_DARK = '#96281B'

  // Read config from the script tag
  var scripts = document.querySelectorAll('script[data-tool], script[src*="widget.js"]')
  var scriptEl = scripts[scripts.length - 1]
  var toolSlug = (scriptEl && scriptEl.getAttribute('data-tool')) || 'adhd-tax-calculator'
  var buttonLabel = (scriptEl && scriptEl.getAttribute('data-label')) || 'SOR7ED'
  var position = (scriptEl && scriptEl.getAttribute('data-position')) || 'bottom-right'

  // Route map — mirrors lib/standaloneRoutes.ts on the server
  var standaloneRoutes = {
    'adhd-tax-calculator': '/adhd-tax-calculator',
    'weekly-wins-generator': '/weekly-wins-generator',
    'biometric-state-tracker': '/biometric-state-tracker',
    'decision-paralysis-solver': '/decision-paralysis-solver',
  }

  function getToolPath(slug) {
    return standaloneRoutes[slug] || '/tools/' + slug
  }

  function init() {
    // Load Google Font
    if (!document.querySelector('link[href*="Bebas+Neue"]')) {
      var link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = FONT_URL
      document.head.appendChild(link)
    }

    // Inject keyframes
    var styleId = '__sor7ed_styles'
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style')
      style.id = styleId
      style.textContent = [
        '@keyframes __sor7ed_pulse {',
        '  0%   { box-shadow: 0 0 0 0 rgba(192,57,43,0.6); }',
        '  70%  { box-shadow: 0 0 0 18px rgba(192,57,43,0); }',
        '  100% { box-shadow: 0 0 0 0 rgba(192,57,43,0); }',
        '}',
        '@keyframes __sor7ed_enter {',
        '  from { opacity: 0; transform: translateY(20px) scale(0.92); }',
        '  to   { opacity: 1; transform: translateY(0) scale(1); }',
        '}',
        '.__sor7ed_shimmer {',
        '  position: absolute;',
        '  inset: 0;',
        '  transform: translateX(-110%) skewX(-20deg);',
        '  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);',
        '  transition: transform 0.6s ease;',
        '  pointer-events: none;',
        '}',
        '.__sor7ed_btn:hover .__sor7ed_shimmer {',
        '  transform: translateX(110%) skewX(-20deg);',
        '}',
      ].join('\n')
      document.head.appendChild(style)
    }

    // Build wrapper
    var wrapper = document.createElement('div')
    wrapper.id = '__sor7ed_widget'
    var isRight = position !== 'bottom-left'
    Object.assign(wrapper.style, {
      position: 'fixed',
      bottom: '24px',
      right: isRight ? '24px' : 'auto',
      left: isRight ? 'auto' : '24px',
      zIndex: '2147483647',
      animation: '__sor7ed_enter 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      animationDelay: '0.8s',
      opacity: '0',
    })

    // Build button
    var btn = document.createElement('a')
    btn.href = BASE_URL + getToolPath(toolSlug)
    btn.target = '_blank'
    btn.rel = 'noopener noreferrer'
    btn.className = '__sor7ed_btn'
    btn.setAttribute('aria-label', buttonLabel + ' — powered by PLANET SOR7ED')

    Object.assign(btn.style, {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '14px 28px',
      background: 'linear-gradient(135deg, ' + BRAND_RED + ' 0%, ' + BRAND_DARK + ' 100%)',
      color: '#ffffff',
      border: '1px solid ' + BRAND_RED,
      borderRadius: '999px',
      fontFamily: "'Bebas Neue', Impact, sans-serif",
      fontSize: '17px',
      letterSpacing: '0.18em',
      textDecoration: 'none',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 0 32px rgba(192,57,43,0.4), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      animation: '__sor7ed_pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      animationDelay: '1.5s',
      userSelect: 'none',
      WebkitFontSmoothing: 'antialiased',
    })

    btn.onmouseenter = function () {
      btn.style.transform = 'scale(1.06)'
      btn.style.boxShadow = '0 0 48px rgba(192,57,43,0.55), 0 6px 28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)'
    }
    btn.onmouseleave = function () {
      btn.style.transform = 'scale(1)'
      btn.style.boxShadow = '0 0 32px rgba(192,57,43,0.4), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)'
    }
    btn.onmousedown = function () { btn.style.transform = 'scale(0.95)' }
    btn.onmouseup = function () { btn.style.transform = 'scale(1.06)' }

    // Lightning icon
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '16')
    svg.setAttribute('height', '16')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'currentColor')
    svg.setAttribute('aria-hidden', 'true')
    svg.style.flexShrink = '0'
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M13 2L3 14h9l-1 8 10-12h-9l1-8z')
    svg.appendChild(path)

    // Shimmer layer
    var shimmer = document.createElement('span')
    shimmer.className = '__sor7ed_shimmer'

    // Label
    var labelEl = document.createElement('span')
    labelEl.textContent = buttonLabel
    labelEl.style.position = 'relative'
    labelEl.style.zIndex = '1'

    btn.appendChild(shimmer)
    btn.appendChild(svg)
    btn.appendChild(labelEl)
    wrapper.appendChild(btn)
    document.body.appendChild(wrapper)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
