/**
 * SOR7ED BUTTON — Partner Widget
 * Embed:
 *   <script src="https://planetsorted.com/widget.js"
 *           data-tool="adhd-tax-calculator"
 *           data-partner="your-clinic"
 *           async></script>
 *
 * Attributes:
 *   data-tool     — tool slug (default: "adhd-tax-calculator")
 *   data-partner  — partner slug; when set, shows a lead-capture panel
 *                   (phone → POST /api/leads) before opening WhatsApp
 *   data-label    — button label (default: "SOR7ED")
 *   data-position — "bottom-right" | "bottom-left" (default: "bottom-right")
 *   data-mode     — "lead" | "whatsapp" (default: "lead" when data-partner set, else "whatsapp")
 *
 * Self-contained: no cookies, no iframes, no external deps beyond Google Font.
 */
;(function () {
  'use strict'

  var BASE_URL = 'https://planetsorted.com'
  var WA_BUSINESS_NUMBER = '447591922247'
  var FONT_URL = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'
  var BRAND_RED = '#C0392B'
  var BRAND_DARK = '#96281B'

  var scripts = document.querySelectorAll('script[data-tool], script[src*="widget.js"]')
  var scriptEl = scripts[scripts.length - 1]
  var toolSlug = (scriptEl && scriptEl.getAttribute('data-tool')) || 'adhd-tax-calculator'
  var buttonLabel = (scriptEl && scriptEl.getAttribute('data-label')) || 'SOR7ED'
  var position = (scriptEl && scriptEl.getAttribute('data-position')) || 'bottom-right'
  var partnerSlug = (scriptEl && scriptEl.getAttribute('data-partner')) || ''
  var modeAttr = scriptEl && scriptEl.getAttribute('data-mode')
  var leadMode = modeAttr === 'lead' || (!modeAttr && !!partnerSlug)

  // Allow partners hosting a copy to override API host via data-api-base
  var apiBase = (scriptEl && scriptEl.getAttribute('data-api-base')) || BASE_URL

  function getWhatsAppLink(slug) {
    var richUrl = BASE_URL + '/r/' + slug
    return 'https://wa.me/' + WA_BUSINESS_NUMBER + '?text=' + encodeURIComponent(richUrl)
  }

  function openWhatsApp() {
    window.open(getWhatsAppLink(toolSlug), '_blank', 'noopener,noreferrer')
  }

  function init() {
    if (!document.querySelector('link[href*="Bebas+Neue"]')) {
      var link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = FONT_URL
      document.head.appendChild(link)
    }

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
        '  position: absolute; inset: 0;',
        '  transform: translateX(-110%) skewX(-20deg);',
        '  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);',
        '  transition: transform 0.6s ease; pointer-events: none;',
        '}',
        '.__sor7ed_btn:hover .__sor7ed_shimmer { transform: translateX(110%) skewX(-20deg); }',
        '.__sor7ed_panel {',
        '  position: absolute; bottom: 64px;',
        '  width: 300px; max-width: calc(100vw - 32px);',
        '  background: #0a0a0a; color: #fff;',
        '  border: 1px solid #333; border-radius: 16px;',
        '  padding: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.55);',
        '  font-family: system-ui, -apple-system, sans-serif;',
        '  display: none;',
        '}',
        '.__sor7ed_panel.open { display: block; }',
        '.__sor7ed_panel h3 {',
        "  margin: 0 0 6px; font-family: 'Bebas Neue', Impact, sans-serif;",
        '  letter-spacing: 0.12em; font-size: 18px; font-weight: 400;',
        '}',
        '.__sor7ed_panel p { margin: 0 0 12px; font-size: 12px; color: #a3a3a3; line-height: 1.4; }',
        '.__sor7ed_panel input {',
        '  width: 100%; box-sizing: border-box;',
        '  border: 1px solid #333; background: #111; color: #fff;',
        '  border-radius: 10px; padding: 10px 12px; font-size: 14px;',
        '  font-family: ui-monospace, monospace; outline: none;',
        '}',
        '.__sor7ed_panel input:focus { border-color: ' + BRAND_RED + '; }',
        '.__sor7ed_panel .__sor7ed_err { color: #f87171; font-size: 11px; margin-top: 6px; min-height: 14px; }',
        '.__sor7ed_panel .__sor7ed_ok { color: #34d399; font-size: 12px; margin-top: 8px; }',
        '.__sor7ed_panel button.__sor7ed_submit {',
        '  width: 100%; margin-top: 10px; border: 0; border-radius: 999px;',
        '  padding: 11px 16px; cursor: pointer; color: #fff;',
        '  background: linear-gradient(135deg, ' + BRAND_RED + ', ' + BRAND_DARK + ');',
        "  font-family: 'Bebas Neue', Impact, sans-serif; letter-spacing: 0.14em; font-size: 15px;",
        '}',
        '.__sor7ed_panel button.__sor7ed_submit:disabled { opacity: 0.55; cursor: wait; }',
        '.__sor7ed_panel .__sor7ed_skip {',
        '  display: block; margin-top: 10px; text-align: center;',
        '  font-size: 11px; color: #737373; text-decoration: underline; cursor: pointer; background: none; border: 0;',
        '}',
        '.__sor7ed_panel .__sor7ed_close {',
        '  position: absolute; top: 8px; right: 10px; background: none; border: 0;',
        '  color: #737373; font-size: 18px; cursor: pointer; line-height: 1;',
        '}',
      ].join('\n')
      document.head.appendChild(style)
    }

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

    // Lead panel (only used when leadMode)
    var panel = null
    if (leadMode) {
      panel = document.createElement('div')
      panel.className = '__sor7ed_panel'
      panel.style[isRight ? 'right' : 'left'] = '0'
      panel.innerHTML =
        '<button type="button" class="__sor7ed_close" aria-label="Close">&times;</button>' +
        '<h3>GET IT SOR7ED</h3>' +
        '<p>Drop your WhatsApp number — we\'ll send this tool straight to your phone. Free, no spam.</p>' +
        '<form>' +
        '  <input type="tel" name="phone" autocomplete="tel" inputmode="tel" ' +
        '    placeholder="e.g. 447591922247" aria-label="WhatsApp number" required />' +
        '  <div class="__sor7ed_err" role="alert"></div>' +
        '  <button type="submit" class="__sor7ed_submit">SEND TO MY WHATSAPP</button>' +
        '</form>' +
        '<button type="button" class="__sor7ed_skip">Or open WhatsApp yourself →</button>' +
        '<div class="__sor7ed_ok" hidden></div>'

      var form = panel.querySelector('form')
      var phoneInput = panel.querySelector('input[name="phone"]')
      var errEl = panel.querySelector('.__sor7ed_err')
      var okEl = panel.querySelector('.__sor7ed_ok')
      var submitBtn = panel.querySelector('.__sor7ed_submit')
      var closeBtn = panel.querySelector('.__sor7ed_close')
      var skipBtn = panel.querySelector('.__sor7ed_skip')

      closeBtn.addEventListener('click', function () {
        panel.classList.remove('open')
      })
      skipBtn.addEventListener('click', function () {
        panel.classList.remove('open')
        openWhatsApp()
      })

      form.addEventListener('submit', function (e) {
        e.preventDefault()
        errEl.textContent = ''
        okEl.hidden = true
        var phone = (phoneInput.value || '').replace(/\D/g, '')
        if (phone.length < 8 || phone.length > 15) {
          errEl.textContent = 'Enter a valid number with country code (digits only).'
          return
        }
        if (!partnerSlug) {
          // No partner configured — fall through to WhatsApp
          openWhatsApp()
          return
        }

        submitBtn.disabled = true
        submitBtn.textContent = 'SENDING…'

        var payload = {
          partner: partnerSlug,
          phone: phone,
          tool: toolSlug,
          source_host: location.hostname || null,
          source_path: (location.pathname || '').slice(0, 500) || null,
        }

        fetch(apiBase.replace(/\/$/, '') + '/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          mode: 'cors',
          credentials: 'omit',
        })
          .then(function (res) {
            return res.json().then(function (data) {
              return { ok: res.ok, status: res.status, data: data }
            })
          })
          .then(function (result) {
            submitBtn.disabled = false
            submitBtn.textContent = 'SEND TO MY WHATSAPP'
            if (!result.ok) {
              errEl.textContent =
                (result.data && result.data.error) ||
                'Could not save your number. Try opening WhatsApp instead.'
              return
            }
            okEl.hidden = false
            okEl.textContent = 'Got it — opening WhatsApp so you can grab the tool…'
            setTimeout(function () {
              panel.classList.remove('open')
              openWhatsApp()
            }, 700)
          })
          .catch(function () {
            submitBtn.disabled = false
            submitBtn.textContent = 'SEND TO MY WHATSAPP'
            errEl.textContent = 'Network error. Try opening WhatsApp instead.'
          })
      })

      wrapper.appendChild(panel)
    }

    // Main button
    var btn
    if (leadMode) {
      btn = document.createElement('button')
      btn.type = 'button'
      btn.addEventListener('click', function () {
        if (panel) panel.classList.toggle('open')
      })
    } else {
      btn = document.createElement('a')
      btn.href = getWhatsAppLink(toolSlug)
      btn.target = '_blank'
      btn.rel = 'noopener noreferrer'
    }
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

    var shimmer = document.createElement('span')
    shimmer.className = '__sor7ed_shimmer'

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
