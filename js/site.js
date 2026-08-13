;(function () {
  var nav = document.getElementById('site-nav')
  if (nav) {
    function onScroll() {
      if (window.scrollY > 20) {
        nav.className =
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      } else {
        nav.className =
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-sm'
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  var overlay = document.getElementById('mobile-overlay')
  var panel = document.getElementById('mobile-panel')
  var openBtn = document.getElementById('nav-open')
  var closeBtn = document.getElementById('nav-close')

  function openNav() {
    if (!overlay || !panel) return
    overlay.classList.remove('hidden')
    panel.classList.remove('hidden')
    document.body.style.overflow = 'hidden'
  }

  function closeNav() {
    if (!overlay || !panel) return
    overlay.classList.add('hidden')
    panel.classList.add('hidden')
    document.body.style.overflow = ''
  }

  if (openBtn) openBtn.addEventListener('click', openNav)
  if (closeBtn) closeBtn.addEventListener('click', closeNav)
  if (overlay) overlay.addEventListener('click', closeNav)
  if (panel) {
    panel.querySelectorAll('.mobile-link').forEach(function (a) {
      a.addEventListener('click', closeNav)
    })
  }

  var subToggle = document.getElementById('mobile-submenu-toggle')
  var sub = document.getElementById('mobile-submenu')
  var chev = document.getElementById('mobile-chev')
  if (subToggle && sub && chev) {
    subToggle.addEventListener('click', function () {
      sub.classList.toggle('hidden')
      chev.classList.toggle('rotate-180')
    })
  }

  var locatiesToggle = document.getElementById('mobile-locaties-toggle')
  var locatiesSub = document.getElementById('mobile-locaties-submenu')
  var locatiesChev = document.getElementById('mobile-locaties-chev')
  if (locatiesToggle && locatiesSub && locatiesChev) {
    locatiesToggle.addEventListener('click', function () {
      locatiesSub.classList.toggle('hidden')
      locatiesChev.classList.toggle('rotate-180')
    })
  }

  var motionMq = window.matchMedia('(min-width: 768px)')

  function markStaggerGrids(section) {
    section.querySelectorAll('.grid').forEach(function (grid) {
      if (grid.classList.contains('js-reveal-lr-row')) return
      var cls = grid.className || ''
      if (!/\bgap-(3|4|6)\b/.test(cls)) return
      if (grid.children.length < 2) return
      grid.classList.add('js-stagger-grid')
    })
  }

  /* Eerst LR-kolommen markeren, zodat ze geen stagger krijgen (volgorde t.o.v. markStaggerGrids). */
  function setupSplitColumns(main) {
    if (!motionMq.matches || !main) return
    var firstSection = main.querySelector(':scope > section')
    main.querySelectorAll('section .grid').forEach(function (grid) {
      var cls = grid.className || ''
      if (cls.indexOf('lg:grid-cols-2') === -1) return
      var sec = grid.closest('section')
      if (sec && firstSection && sec === firstSection) return
      var kids = grid.children
      if (kids.length < 2) return
      if (grid.classList.contains('js-reveal-lr-row')) return
      grid.classList.add('js-reveal-lr-row')
      kids[0].classList.add('js-reveal-left')
      kids[1].classList.add('js-reveal-right')
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-inview')
            obs.unobserve(entry.target)
          })
        },
        { rootMargin: '-50px 0px -50px 0px', threshold: 0.08 },
      )
      obs.observe(grid)
    })
  }

  function setupSectionReveals(main) {
    if (!motionMq.matches || !main) return
    var sections = main.querySelectorAll(':scope > section')
    sections.forEach(function (section, index) {
      if (index === 0) return
      section.classList.add('js-reveal-section')
      markStaggerGrids(section)
    })

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-inview')
          obs.unobserve(entry.target)
        })
      },
      { root: null, rootMargin: '-50px 0px -50px 0px', threshold: 0.05 },
    )

    main.querySelectorAll('.js-reveal-section').forEach(function (el) {
      obs.observe(el)
    })
  }

  function parseStatText(text) {
    var t = String(text || '').trim()
    var m = t.match(/^(\d+)\+$/)
    if (m) return { target: parseInt(m[1], 10), suffix: '+', duration: 2000 }
    m = t.match(/^(\d+)\/7$/)
    if (m) return { target: parseInt(m[1], 10), suffix: '/7', duration: 2000 }
    m = t.match(/^(\d+)\.(\d)$/)
    if (m) return { target: parseInt(m[1], 10), suffix: '.' + m[2], duration: 2000 }
    return null
  }

  function runCounter(el, spec) {
    var inner = document.createElement('span')
    inner.className = 'js-counter-inner'
    el.textContent = ''
    el.appendChild(inner)
    var start = null
    function frame(ts) {
      if (start == null) start = ts
      var progress = Math.min((ts - start) / spec.duration, 1)
      var eased = 1 - Math.pow(1 - progress, 3)
      var val = Math.floor(eased * spec.target)
      inner.textContent = val + spec.suffix
      if (progress < 1) requestAnimationFrame(frame)
      else inner.textContent = spec.target + spec.suffix
    }
    requestAnimationFrame(frame)
  }

  function setupCounters() {
    if (!motionMq.matches) return
    var selectors = [
      'section .rounded-3xl.bg-gray-900 div.text-center > .text-3xl',
      'section .rounded-2xl.bg-brand-50 .text-3xl.font-extrabold',
      'section .rounded-2xl.bg-yellow-50 .text-3xl.font-extrabold',
      'section .rounded-2xl.bg-blue-50 .text-3xl.font-extrabold',
      'section .rounded-2xl.bg-purple-50 .text-3xl.font-extrabold',
    ]
    var seen = new WeakSet()
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (seen.has(el)) return
        var spec = parseStatText(el.textContent)
        if (!spec) return
        seen.add(el)
        var obs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return
              obs.unobserve(entry.target)
              runCounter(el, spec)
            })
          },
          { threshold: 0.2, rootMargin: '0px' },
        )
        obs.observe(el)
      })
    })
  }

  var main = document.querySelector('main')
  setupSplitColumns(main)
  setupSectionReveals(main)
  setupCounters()
})()
