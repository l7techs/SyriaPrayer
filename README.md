# Syria Prayer website · موقع صلاة سوريا

The website for the **Syria Prayer** app (prayer times, Qibla, Hijri calendar,
adhkar and Tasbih), in English and Arabic.

- `index.html`: landing page with a Qibla finder, a Tasbih demo and a
  screenshot gallery
- `privacy.html`: Privacy Policy
- `terms.html`: Terms of Service

Plain HTML, CSS and JavaScript with no build step, no cookies, no analytics
and no third-party requests.

## Language

The page picks Arabic or English from `?lang=ar` / `?lang=en`, then the
visitor's last choice, then the browser language. Every piece of text exists
in both languages as `data-l="en"` / `data-l="ar"` elements; CSS shows the
active one and the page switches to RTL for Arabic.

Store-ready links:

- Privacy: `/privacy.html?lang=en` and `/privacy.html?lang=ar`
- Terms: `/terms.html?lang=en` and `/terms.html?lang=ar`

## Publish with GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
The site will be at `https://l7techs.github.io/SyriaPrayer/`.

## When the App Store listing is live

In `index.html`, set the App Store button's `href` (two places) and remove its
`soon` class.

## Run locally

```bash
python -m http.server 8000
```
