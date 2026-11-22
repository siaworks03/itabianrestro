# Itabian Restro — connect page

Static page (plain HTML, CSS, JavaScript). No build step, no dependencies.

## Structure
```
index.html        page markup (edit link URLs here)
css/style.css     all styles (colours are variables at the top)
js/main.js        menu pop-up + image fallback
assets/           logo.webp, logo.png, menu.jpg
.nojekyll         tells GitHub Pages to serve files as-is
```

## Before sending to the client
1. **Menu**: replace `assets/menu.jpg` with the real menu photo. For several pages, add files and list them in `data-menu-images="assets/menu-1.jpg,assets/menu-2.jpg"` on the Menu button.
2. **Google Reviews**: in `index.html` search for `writereview` and put the restaurant's real Place ID in the link.
3. **Google Maps**: currently uses the link from the Instagram bio. Check it opens the right place.
4. **Logo**: `assets/logo.*` was cropped from a screenshot. Swap in the original logo file (same names) for a sharper result.
5. **Social preview**: after deploying, set the `og:image` content in `index.html` to the full live URL of `assets/logo.png`.

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000

## Deploy on GitHub Pages
1. Push these files to the **root** of a GitHub repository.
2. Repo → **Settings → Pages** → Source: **Deploy from a branch**, Branch **main**, folder **/ (root)** → Save.
3. After a minute the site is live at `https://<username>.github.io/<repo-name>/`.
