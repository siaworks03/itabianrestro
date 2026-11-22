/* ==========================================================
   Itabian Restro
   1) Image fallback: if an image fails, show a small branded
      placeholder instead of a broken-image icon.
   2) Menu pop-up: the Menu button opens the menu pictures in
      a full-screen viewer. If JavaScript is off, the button
      still works as a normal link to the picture.
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
  var trigger = document.querySelector("[data-menu-images="assets/menu1.jpg,assets/menu2.jpg,assets/menu3.jpg,assets/menu4.jpg,assets/menu5.jpg,assets/menu6.jpg,assets/menu7.jpg"]");
  var modal = document.getElementById("menu-modal");
  var pages = document.getElementById("menu-pages");

  // Old browsers without <dialog>: leave the link as it is (opens the picture in a new tab)
  if (!trigger || !modal || !pages || typeof modal.showModal !== "function") return;

  var closeBtn = modal.querySelector(".menu-close");
  var root = document.documentElement;
  var built = false;

  function buildPages() {
    if (built) return;
    built = true;

    var list = (trigger.getAttribute("data-menu-images") || "")
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    list.forEach(function (src, i) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = "Itabian Restro menu, page " + (i + 1) + " of " + list.length;
      img.decoding = "async";
      img.addEventListener("error", function () {
        var msg = document.createElement("p");
        msg.className = "menu-error";
        msg.textContent = "Couldn't load this menu page. Please check your connection and try again.";
        img.replaceWith(msg);
      });
      pages.appendChild(img);
    });

    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "menu-error";
      empty.textContent = "The menu isn't available right now. Please call us to ask.";
      pages.appendChild(empty);
    }
  }

  function openMenu() {
    buildPages();
    modal.showModal();
    root.classList.add("menu-open");
    pages.scrollTop = 0;
  }

  function closeMenu() {
    if (modal.open) modal.close();
  }

  trigger.addEventListener("click", function (e) {
    e.preventDefault();
    openMenu();
  });

  closeBtn.addEventListener("click", closeMenu);

  // Click on the dark backdrop (outside the panel) closes the menu
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeMenu();
  });

  // Fires for the Esc key and for close(): unlock page scrolling again
  modal.addEventListener("close", function () {
    root.classList.remove("menu-open");
  });
})();
