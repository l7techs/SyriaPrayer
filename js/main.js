/* Syria Prayer website: language + theme switching and the interactive demos.
   Everything runs in the browser. Nothing is sent anywhere. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- Language ---------- */
  function pickLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "ar" || q === "en") return q;
    var saved = store("lang");
    if (saved === "ar" || saved === "en") return saved;
    return (navigator.language || "en").toLowerCase().indexOf("ar") === 0 ? "ar" : "en";
  }
  var listeners = [];
  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    var t = document.querySelector("meta[name='title-" + lang + "']");
    if (t) document.title = t.content;
    listeners.forEach(function (fn) { fn(lang); });
  }
  function onLang(fn) { listeners.push(fn); }
  setLang(pickLang());

  document.querySelectorAll("[data-action='lang']").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = root.lang === "ar" ? "en" : "ar";
      store("lang", next);
      setLang(next);
    });
  });

  /* ---------- Theme ---------- */
  var savedTheme = store("theme");
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  function isDark() {
    if (root.dataset.theme) return root.dataset.theme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  document.querySelectorAll("[data-action='theme']").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      store("theme", next);
    });
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Language-aware images ---------- */
  function swapImages(lang) {
    document.querySelectorAll("img[data-src-en]").forEach(function (img) {
      var src = img.getAttribute("data-src-" + lang);
      if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
  }
  onLang(swapImages);
  swapImages(root.lang);

  /* ---------- Today: Gregorian + Hijri ---------- */
  function renderToday(lang) {
    var now = new Date();
    var loc = lang === "ar" ? "ar-SY" : "en-GB";
    var set = function (sel, opts, cal) {
      var el = document.querySelector(sel);
      if (!el) return;
      try {
        el.textContent = new Intl.DateTimeFormat(loc + (cal ? "-u-ca-" + cal : ""), opts).format(now);
      } catch (e) { el.textContent = "—"; }
    };
    set("[data-today='greg']", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    set("[data-today='hijri']", { day: "numeric", month: "long", year: "numeric" }, "islamic-umalqura");
    set("[data-today='hijri-chip']", { day: "numeric", month: "long", year: "numeric" }, "islamic-umalqura");
  }
  onLang(renderToday);
  renderToday(root.lang);

  /* ---------- Qibla ---------- */
  var KAABA = { lat: 21.422487, lon: 39.826206 };
  var CITIES = [
    ["damascus", "Damascus", "دمشق", 33.5138, 36.2765],
    ["aleppo", "Aleppo", "حلب", 36.2021, 37.1343],
    ["homs", "Homs", "حمص", 34.7324, 36.7137],
    ["hama", "Hama", "حماة", 35.1318, 36.7578],
    ["latakia", "Latakia", "اللاذقية", 35.5317, 35.7915],
    ["tartus", "Tartus", "طرطوس", 34.8890, 35.8866],
    ["idlib", "Idlib", "إدلب", 35.9306, 36.6339],
    ["raqqa", "Raqqa", "الرقة", 35.9528, 39.0079],
    ["deir", "Deir ez-Zor", "دير الزور", 35.3359, 40.1408],
    ["hasakah", "Al-Hasakah", "الحسكة", 36.5024, 40.7477],
    ["qamishli", "Qamishli", "القامشلي", 37.0522, 41.2311],
    ["daraa", "Daraa", "درعا", 32.6189, 36.1021],
    ["suwayda", "As-Suwayda", "السويداء", 32.7090, 36.5695],
    ["istanbul", "Istanbul", "إسطنبول", 41.0082, 28.9784],
    ["beirut", "Beirut", "بيروت", 33.8938, 35.5018],
    ["amman", "Amman", "عمّان", 31.9454, 35.9284],
    ["cairo", "Cairo", "القاهرة", 30.0444, 31.2357],
    ["berlin", "Berlin", "برلين", 52.5200, 13.4050],
    ["london", "London", "لندن", 51.5072, -0.1276],
    ["stockholm", "Stockholm", "ستوكهولم", 59.3293, 18.0686],
    ["newyork", "New York", "نيويورك", 40.7128, -74.0060],
    ["toronto", "Toronto", "تورنتو", 43.6532, -79.3832]
  ];
  var rad = function (d) { return d * Math.PI / 180; };
  var deg = function (r) { return r * 180 / Math.PI; };
  function qibla(lat, lon) {
    var p1 = rad(lat), p2 = rad(KAABA.lat), dl = rad(KAABA.lon - lon);
    var y = Math.sin(dl) * Math.cos(p2);
    var x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    var bearing = (deg(Math.atan2(y, x)) + 360) % 360;
    var a = Math.pow(Math.sin((p2 - p1) / 2), 2) + Math.cos(p1) * Math.cos(p2) * Math.pow(Math.sin(dl / 2), 2);
    var km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return { bearing: bearing, km: km };
  }
  var sel = document.getElementById("city");
  var needle = document.querySelector(".needle");
  var out = document.getElementById("qibla-deg");
  var dist = document.getElementById("qibla-dist");
  var note = document.getElementById("qibla-note");
  var current = { key: "damascus", lat: CITIES[0][3], lon: CITIES[0][4], label: null };
  var needleAngle = 0;

  function fillCities(lang) {
    if (!sel) return;
    var keep = sel.value || current.key;
    sel.innerHTML = "";
    CITIES.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c[0];
      o.textContent = lang === "ar" ? c[2] : c[1];
      sel.appendChild(o);
    });
    if (current.key === "gps") {
      var g = document.createElement("option");
      g.value = "gps";
      g.textContent = lang === "ar" ? "موقعي الحالي" : "My location";
      sel.insertBefore(g, sel.firstChild);
    }
    sel.value = keep;
  }
  function renderQibla(lang) {
    if (!out) return;
    var r = qibla(current.lat, current.lon);
    // Rotate the shortest way so the needle never spins a full turn.
    var delta = ((r.bearing - needleAngle) % 360 + 540) % 360 - 180;
    needleAngle += delta;
    needle.style.transform = "rotate(" + needleAngle + "deg)";
    var nf = new Intl.NumberFormat(lang === "ar" ? "ar-SY" : "en-GB", { maximumFractionDigits: 1 });
    var nk = new Intl.NumberFormat(lang === "ar" ? "ar-SY" : "en-GB", { maximumFractionDigits: 0 });
    out.firstChild.nodeValue = nf.format(r.bearing) + "°";
    dist.textContent = lang === "ar"
      ? "من الشمال · " + nk.format(r.km) + " كم إلى الكعبة"
      : "from true north · " + nk.format(r.km) + " km to the Kaaba";
  }
  if (sel) {
    fillCities(root.lang);
    sel.addEventListener("change", function () {
      var c = CITIES.filter(function (x) { return x[0] === sel.value; })[0];
      if (!c) return;
      current = { key: c[0], lat: c[3], lon: c[4] };
      note.textContent = "";
      renderQibla(root.lang);
    });
    onLang(function (l) { fillCities(l); renderQibla(l); note.textContent = ""; });
    renderQibla(root.lang);
    var gpsBtn = document.getElementById("use-gps");
    gpsBtn.addEventListener("click", function () {
      var ar = root.lang === "ar";
      if (!navigator.geolocation) { note.textContent = ar ? "المتصفح لا يدعم تحديد الموقع." : "Your browser can't share a location."; return; }
      note.textContent = ar ? "جارٍ تحديد موقعك…" : "Finding your location…";
      navigator.geolocation.getCurrentPosition(function (p) {
        current = { key: "gps", lat: p.coords.latitude, lon: p.coords.longitude };
        fillCities(root.lang);
        sel.value = "gps";
        renderQibla(root.lang);
        note.textContent = root.lang === "ar"
          ? "حُسب في متصفحك. لم يُرسل موقعك إلى أي مكان."
          : "Calculated in your browser. Your location was not sent anywhere.";
      }, function () {
        note.textContent = root.lang === "ar" ? "لم يُسمح بالوصول إلى الموقع. اختر مدينة من القائمة." : "Location access wasn't allowed. Pick a city instead.";
      }, { timeout: 10000, maximumAge: 600000 });
    });
  }

  /* ---------- Tasbih ---------- */
  var DHIKR = [
    { ar: "سُبْحَانَ اللَّه", en: "SubhanAllah · Glory be to Allah" },
    { ar: "الْحَمْدُ لِلَّه", en: "Alhamdulillah · All praise is for Allah" },
    { ar: "اللَّهُ أَكْبَر", en: "Allahu Akbar · Allah is the Greatest" }
  ];
  var TARGET = 33;
  var tBtn = document.getElementById("tasbih");
  if (tBtn) {
    var prog = tBtn.querySelector(".prog");
    var cnt = tBtn.querySelector(".count");
    var ofEl = tBtn.querySelector(".of");
    var dEl = document.getElementById("dhikr");
    var dTr = document.getElementById("dhikr-tr");
    var C = 2 * Math.PI * 92;
    prog.style.strokeDasharray = C;
    var st = { i: 0, n: 0 };
    try { var s = JSON.parse(store("tasbih") || "null"); if (s && s.i >= 0 && s.i < 3 && s.n >= 0 && s.n < TARGET) st = s; } catch (e) {}
    function draw(lang) {
      lang = lang || root.lang;
      var nf = new Intl.NumberFormat(lang === "ar" ? "ar-SY" : "en-GB");
      cnt.textContent = nf.format(st.n);
      ofEl.textContent = (lang === "ar" ? "من " : "of ") + nf.format(TARGET);
      prog.style.strokeDashoffset = C * (1 - st.n / TARGET);
      dEl.textContent = DHIKR[st.i].ar;
      dTr.textContent = lang === "ar" ? "" : DHIKR[st.i].en;
    }
    function tap() {
      st.n++;
      if (st.n >= TARGET) {
        st.n = 0; st.i = (st.i + 1) % DHIKR.length;
        tBtn.classList.remove("pulse"); void tBtn.offsetWidth; tBtn.classList.add("pulse");
        if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
      } else if (navigator.vibrate) navigator.vibrate(8);
      store("tasbih", JSON.stringify(st));
      draw();
    }
    tBtn.addEventListener("click", tap);
    document.getElementById("tasbih-reset").addEventListener("click", function () {
      st = { i: 0, n: 0 }; store("tasbih", JSON.stringify(st)); draw();
    });
    onLang(draw);
    draw();
  }

  /* ---------- Gallery ---------- */
  var track = document.querySelector(".track");
  if (track) {
    var figs = Array.prototype.slice.call(track.querySelectorAll("figure"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".gallery-tabs button"));
    function goTo(i) {
      i = Math.max(0, Math.min(figs.length - 1, i));
      // Works the same in LTR and RTL (scrollLeft is negative in RTL).
      var tr = track.getBoundingClientRect(), fr = figs[i].getBoundingClientRect();
      track.scrollBy({ left: (fr.left + fr.width / 2) - (tr.left + tr.width / 2), behavior: "smooth" });
    }
    function nearest() {
      var tr = track.getBoundingClientRect(), mid = tr.left + tr.width / 2, best = 0, bd = Infinity;
      figs.forEach(function (f, i) { var r = f.getBoundingClientRect(); var d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    tabs.forEach(function (t, i) { t.addEventListener("click", function () { goTo(i); }); });
    var tick;
    track.addEventListener("scroll", function () {
      clearTimeout(tick);
      tick = setTimeout(function () {
        var n = nearest();
        tabs.forEach(function (t, i) { t.setAttribute("aria-selected", String(i === n)); });
      }, 60);
    }, { passive: true });
    // "Next" means forward in reading order, which is leftwards in RTL.
    document.querySelector("[data-gal='prev']").addEventListener("click", function () { goTo(nearest() - 1); });
    document.querySelector("[data-gal='next']").addEventListener("click", function () { goTo(nearest() + 1); });
  }

  /* ---------- Legal pages: highlight current section in the TOC ---------- */
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var heads = document.querySelectorAll(".prose h2[id]");
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        tocLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    heads.forEach(function (h) { tio.observe(h); });
  }
})();
