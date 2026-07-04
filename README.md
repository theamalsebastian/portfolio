# Amal Sebastian — Portfolio Site

Static multi-page site. No build step, no framework — open `index.html` in a browser or deploy the folder as-is.

## Folder structure

```
portfolio/
├── index.html          Home
├── about.html           About + skills
├── academics.html       Education timeline + certifications
├── achievements.html    Certificates + hackathon
├── projects.html        Projects, with live search + tag filter
├── research.html        Applied research / engineering write-ups
├── contact.html         Contact form (Formspree) + direct details
├── blogs.html           Blog page (empty state — first post pending)
├── feedbacks.html        Not linked in nav yet — ready to switch on later (see below)
├── css/
│   └── style.css        All design tokens + styles, shared across pages
├── js/
│   └── main.js          Nav toggle, hero canvas animation, scroll reveal,
│                         project search/filter, contact form submit
└── images/
    ├── certs/           Certificate images (optional)
    ├── projects/         Project thumbnails (optional)
    ├── research/          Research card images (optional)
    ├── feedback/          Testimonial avatars (optional, for later)
    └── blog/              Blog post images (optional, for later)
```

Every image reference has a graceful fallback (fades out if missing), so the site looks clean with or without images in the `images/` folders — add real screenshots whenever you want to.

## One thing still needed before the contact form works

The contact form posts to Formspree but needs your real form ID. In `contact.html`, find:

```html
<form id="contact-form" class="reveal" data-endpoint="https://formspree.io/f/YOUR_FORM_ID">
```

Create a free form at [formspree.io](https://formspree.io) and replace `YOUR_FORM_ID` with your actual endpoint. No backend or API key required. Until this is set, the form will show a friendly message telling visitors to email you directly instead of failing silently.

## Adding the feedback page back later

`feedbacks.html` exists but isn't linked from the nav or footer, since there's no real client feedback yet. When you have some:

1. Add `<li><a href="feedbacks.html">Feedback</a></li>` to the `.nav-links` list in every page's header.
2. Add `<a href="feedbacks.html">Feedback</a>` to the footer's "Site" column on every page.
3. Fill in `feedbacks.html`'s stat numbers and add one `.testimonial` block per real quote (a commented example is already in the file).

## Design notes

- Palette: cool paper background, near-black ink, cobalt-blue primary accent, coral used sparingly for emphasis dots/tags.
- Type: Fraunces (display/headings), Inter (body), JetBrains Mono (labels, tags, nav — a nod to reading code).
- Signature element: the animated node/edge graph in the home hero is a lightweight canvas sketch meant to evoke an embedding space — literally the thing the RAG project is built on.
- Fully responsive, keyboard-focus-visible, and respects `prefers-reduced-motion` (hero canvas animation and scroll reveals turn off).

## Deploying

**Vercel** (recommended, free):
```
npm i -g vercel
cd portfolio
vercel
```
Or drag-and-drop the `portfolio` folder into vercel.com/new.

**GitHub Pages:**
```
cd portfolio
git init && git add . && git commit -m "portfolio site"
git remote add origin https://github.com/theamalsebastian/portfolio.git
git push -u origin main
```
Then enable Pages in repo Settings, deploying from the `main` branch root.
