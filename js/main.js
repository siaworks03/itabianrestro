/* ==========================================================
   Itabian Restro
   1) Image fallback: if an image fails, show a small branded
      placeholder instead of a broken-image icon.
   2) Menu pop-up: the Menu button opens the menu pictures in
      a full-screen viewer with previous / next buttons, zoom
      controls, swipe and pinch. If JavaScript is off, the
      button still works as a normal link to the picture.
   ========================================================== */
(function () {
  "use strict";

  /* ---------- 1) Image fallback ---------- */
  var IMAGE_OFF_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<line x1="2" y1="2" x2="22" y2="22"></line>' +
    '<path d="M10.41 10.41a2 2 0 1 1-2.82-2.82"></path>' +
    '<line x1="13.5" y1="13.5" x2="6" y2="21"></line>' +
    '<line x1="18" y1="12" x2="21" y2="15"></line>' +
    '<path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"></path>' +
    '<path d="M21 15V5a2 2 0 0 0-2-2H9"></path></svg>';

  function showFallback(img) {
    if (img.dataset.failed) return;
    img.dataset.failed = "true";

    var label = img.getAttribute("data-fallback") || "";
    if (!label) {
      img.style.display = "none";
      return;
    }

    var box = document.createElement("div");
    box.className = "img-fallback " + img.className;
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", img.alt);
    box.innerHTML = IMAGE_OFF_SVG + "<span></span>";
    box.querySelector("span").textContent = label;

    if (img.parentElement && img.parentElement.classList.contains("brand-logo")) {
      box.style.width = "100%";
      box.style.height = "100%";
    }

    img.replaceWith(box);
  }

  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () {
      showFallback(img);
    });
    // The image may have already failed before this script ran
    if (img.complete && img.naturalWidth === 0) {
      showFallback(img);
    }
  });

  /* ---------- 2) Menu pop-up ---------- */
  var trigger = document.querySelector("[data-menu-images]");
  var modal = document.getElementById("menu-modal");
  var stage = document.getElementById("menu-stage");

  // Old browsers without <dialog>: leave the link as it is (opens the picture in a new tab)
  if (!trigger || !modal || !stage || typeof modal.showModal !== "function") return;

  var closeBtn = modal.querySelector(".menu-close");
  var prevBtn = modal.querySelector(".menu-prev");
  var nextBtn = modal.querySelector(".menu-next");
  var counter = document.getElementById("menu-counter");
  var zoomInBtn = document.getElementById("menu-zoom-in");
  var zoomOutBtn = document.getElementById("menu-zoom-out");
  var zoomResetBtn = document.getElementById("menu-zoom-reset");
  var root = document.documentElement;

  var MIN_ZOOM = 1; // 1 = whole page fits on screen
  var MAX_ZOOM = 4;
  var ZOOM_STEP = 1.5;

  var list = (trigger.getAttribute("data-menu-images") || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);

  var index = 0;
  var zoom = 1;
  var img = null;

  function preload(i) {
    if (i < 0 || i >= list.length) return;
    var p = new Image();
    p.src = list[i];
  }

  // Size the picture: "fit" size (whole page visible) multiplied by the zoom level
  function layout() {
    if (!img || !img.naturalWidth) return;
    var fit = Math.min(stage.clientWidth / img.naturalWidth, stage.clientHeight / img.naturalHeight);
    img.style.width = img.naturalWidth * fit * zoom + "px";
    img.style.height = img.naturalHeight * fit * zoom + "px";
  }

  function updateUi() {
    counter.textContent = list.length > 1 ? index + 1 + " / " + list.length : "";
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= list.length - 1;
    prevBtn.hidden = nextBtn.hidden = list.length < 2;
    zoomOutBtn.disabled = zoom <= MIN_ZOOM;
    zoomInBtn.disabled = zoom >= MAX_ZOOM;
    zoomResetBtn.disabled = zoom === MIN_ZOOM;
  }

  // Zoom around a point (cx, cy) inside the stage so the spot under the finger stays put
  function setZoom(z, cx, cy) {
    z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
    if (z === zoom) return;
    if (cx === undefined) {
      cx = stage.clientWidth / 2;
      cy = stage.clientHeight / 2;
    }
    var rx = (stage.scrollLeft + cx) / (stage.scrollWidth || 1);
    var ry = (stage.scrollTop + cy) / (stage.scrollHeight || 1);
    zoom = z;
    layout();
    stage.scrollLeft = rx * stage.scrollWidth - cx;
    stage.scrollTop = ry * stage.scrollHeight - cy;
    updateUi();
  }

  function show(i) {
    if (i < 0 || i >= list.length) return;
    index = i;
    zoom = 1;
    stage.textContent = "";
    stage.scrollLeft = 0;
    stage.scrollTop = 0;

    img = document.createElement("img");
    img.alt = "Itabian Restro menu, page " + (i + 1) + " of " + list.length;
    img.draggable = false;
    img.decoding = "async";
    img.addEventListener("load", layout);
    img.addEventListener("error", function () {
      var msg = document.createElement("p");
      msg.className = "menu-error";
      msg.textContent = "Couldn't load this menu page. Please check your connection and try again.";
      stage.textContent = "";
      stage.appendChild(msg);
      img = null;
    });
    img.src = list[i];
    stage.appendChild(img);
    if (img.complete && img.naturalWidth) layout();

    updateUi();
    preload(i + 1);
    preload(i - 1);
  }

  function openMenu() {
    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "menu-error";
      empty.textContent = "The menu isn't available right now. Please call us to ask.";
      stage.textContent = "";
      stage.appendChild(empty);
      updateUi();
    } else {
      show(index);
    }
    modal.showModal();
    root.classList.add("menu-open");
    layout();
  }

  function closeMenu() {
    if (modal.open) modal.close();
  }

  trigger.addEventListener("click", function (e) {
    e.preventDefault();
    openMenu();
  });

  closeBtn.addEventListener("click", closeMenu);
  prevBtn.addEventListener("click", function () { show(index - 1); });
  nextBtn.addEventListener("click", function () { show(index + 1); });
  zoomInBtn.addEventListener("click", function () { setZoom(zoom * ZOOM_STEP); });
  zoomOutBtn.addEventListener("click", function () { setZoom(zoom / ZOOM_STEP); });
  zoomResetBtn.addEventListener("click", function () { setZoom(1); });

  // Click on the dark backdrop (outside the panel) closes the menu
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeMenu();
  });

  // Fires for the Esc key and for close(): unlock page scrolling again
  modal.addEventListener("close", function () {
    root.classList.remove("menu-open");
  });

  // Keyboard: arrows = pages, + / - = zoom, 0 = fit (Esc closes natively)
  modal.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "+" || e.key === "=") setZoom(zoom * ZOOM_STEP);
    else if (e.key === "-") setZoom(zoom / ZOOM_STEP);
    else if (e.key === "0") setZoom(1);
  });

  window.addEventListener("resize", function () {
    if (modal.open) layout();
  });

  // Double-click (desktop): toggle between fit and zoomed
  stage.addEventListener("dblclick", function (e) {
    var r = stage.getBoundingClientRect();
    setZoom(zoom > 1 ? 1 : 2.5, e.clientX - r.left, e.clientY - r.top);
  });

  /* ---- Touch: pinch to zoom, double-tap to zoom, swipe to change page (only when not zoomed) ---- */
  var startX = 0;
  var startY = 0;
  var swipeOk = false;
  var pinchDist = 0;
  var pinchZoom = 1;
  var lastTap = 0;

  function dist(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  }

  stage.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) {
      pinchDist = dist(e.touches);
      pinchZoom = zoom;
      swipeOk = false;
    } else if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swipeOk = zoom === 1;
    }
  }, { passive: true });

  stage.addEventListener("touchmove", function (e) {
    if (e.touches.length === 2 && pinchDist) {
      e.preventDefault();
      var r = stage.getBoundingClientRect();
      var cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
      var cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      setZoom(pinchZoom * (dist(e.touches) / pinchDist), cx, cy);
    }
  }, { passive: false });

  stage.addEventListener("touchend", function (e) {
    if (e.touches.length < 2) pinchDist = 0;
    if (e.changedTouches.length !== 1 || e.touches.length) return;

    var t = e.changedTouches[0];
    var dx = t.clientX - startX;
    var dy = t.clientY - startY;

    // swipe left / right = next / previous page (only when the page is not zoomed)
    if (swipeOk && zoom === 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(index + (dx < 0 ? 1 : -1));
      lastTap = 0;
      return;
    }

    // double-tap = toggle zoom
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      var now = Date.now();
      if (now - lastTap < 300) {
        var r = stage.getBoundingClientRect();
        setZoom(zoom > 1 ? 1 : 2.5, t.clientX - r.left, t.clientY - r.top);
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }
  }, { passive: true });
})();
