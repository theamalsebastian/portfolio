# 🚀 Portfolio Website

Welcome to my personal portfolio website!  
This site showcases my projects, skills, and journey as a backend & AI engineering enthusiast.

🌐 **Live Demo:** [theamalsebastian.vercel.app](https://theamalsebastian.vercel.app)

---

## 📖 About
This portfolio highlights:
- My backend development projects (FastAPI, Flask, Python)
- AI/ML experiments including RAG systems and AI agents
- Open-source contributions and coding practice
- Career goals and freelancing journey

---

## 🛠️ Tech Stack
- **Frontend:** one HTML page, plain CSS and JavaScript (no build step)
- **Type:** Barlow Condensed + Barlow (Google Fonts)
- **Motion:** CSS transitions and one small scroll script; Lenis smooth scroll is fetched only on desktop pointers; `prefers-reduced-motion` respected
- **Weight:** no libraries on phones; recordings load only when played (720px versions on phones, posters only on Data Saver or slow connections)
- **Deployment:** Vercel (`vercel.json` redirects the old page URLs to their sections)

---

## ✨ Features
- Long-scroll single page: a pinned title over the live demos, figures that roll in, project list with a held screen, research notes, about, credentials, contact
- Graphite and light-grey sections with safety-orange buttons; phone menu; tested from 320px phones to 1920px screens
- "Search my work": an in-page hybrid ranking (BM25 + concept match, fused with Reciprocal Rank Fusion), the same idea as the Job Search AI project
- Project footage is screen recordings of the live demos (muted MP4 loops with poster frames)

---

## 📂 Structure
```
index.html          the page
css/style.css       tokens, layout, motion
js/main.js          smooth scroll, menu, pinned hero, figures, entrances
js/search.js        the in-page hybrid search
media/              demo recordings (phone 2:3 and desktop 16:10) with posters
vercel.json         redirects for the old multi-page URLs
```
