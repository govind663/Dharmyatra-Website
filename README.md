# Divya Dhara

> **A Spiritual & Cultural Digital Platform**

**Live Website:** https://divya-dhara.in/

Divya Dhara is a modern, responsive spiritual and cultural website built with **React, TypeScript and Vite**. The platform is designed to provide visitors with an engaging digital experience around Indian spirituality, temples, traditions, devotional content, pilgrimage information and cultural resources.

The website focuses on a clean premium interface, mobile-first responsiveness, SEO-friendly content structure and fast performance.

---

## 🌐 Live Website

**Production:**
https://divya-dhara.in/

---

## ✨ Features

* Modern premium spiritual/cultural UI
* Fully responsive design
* Mobile, tablet and desktop support
* React + TypeScript architecture
* Vite-powered development and production build
* Reusable component-based architecture
* SEO-friendly page structure
* Dynamic page metadata
* Search-engine friendly URLs
* Breadcrumb navigation
* Spiritual and pilgrimage content
* Temple and cultural information
* Gallery/media sections
* Blog/content sections
* WhatsApp enquiry/contact integration
* Contact and enquiry forms
* Google Maps integration where required
* Fast-loading optimized frontend
* Production-ready cPanel deployment
* SPA routing support
* Custom 404 handling through React routing
* `robots.txt`
* `sitemap.xml`
* Social sharing metadata
* Open Graph metadata
* Semantic HTML structure

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* HTML5
* CSS3
* JavaScript / TypeScript
* React Router

### Development

* ESLint
* Vite HMR
* TypeScript type checking
* Component-based development

### Deployment

* Apache / cPanel
* Static production build
* `.htaccess` SPA fallback
* HTTPS
* Custom domain

---

## 📁 Project Structure

```text
divya-dhara/
├── public/
│   ├── favicon/
│   ├── images/
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── sections/
│   │   └── ui/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Temples/
│   │   ├── Pilgrimage/
│   │   ├── Gallery/
│   │   ├── Blog/
│   │   └── Contact/
│   │
│   ├── data/
│   ├── hooks/
│   ├── layouts/
│   ├── routes/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
└── README.md
```

> Folder names may differ depending on the current implementation. The structure above represents the recommended organization for the Divya Dhara project.

---

## 🚀 Getting Started

### Requirements

Make sure the development environment has:

* Node.js
* npm
* Git

Check installed versions:

```bash
node -v
npm -v
```

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd divya-dhara
npm install
```

---

## 💻 Development

Start the Vite development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173/
```

Vite provides Hot Module Replacement (HMR), so changes are reflected automatically during development.

---

## 🏗️ Production Build

Create an optimized production build:

```bash
npm run build
```

The generated production files will be available inside:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🔍 Type Checking

Run TypeScript checking before deployment:

```bash
npx tsc --noEmit
```

The production project should be deployed only after TypeScript errors have been resolved.

---

## 🧹 Linting

Run ESLint:

```bash
npm run lint
```

Fix automatically fixable issues where supported:

```bash
npm run lint -- --fix
```

---

## 🔎 SEO

Divya Dhara is structured with SEO in mind.

SEO implementation should include:

* Unique page titles
* Unique meta descriptions
* Canonical URLs
* Open Graph metadata
* Twitter/social metadata
* Semantic headings
* Breadcrumbs
* Descriptive image alt text
* SEO-friendly URLs
* Internal linking
* Structured content
* `robots.txt`
* `sitemap.xml`
* Mobile-friendly responsive design
* Fast page loading
* Clean HTML structure

### Production Domain

All canonical URLs should use:

```text
https://divya-dhara.in/
```

Avoid using localhost URLs in production metadata.

---

## 🤖 Search Engine Files

The production website should expose:

```text
https://divya-dhara.in/robots.txt
```

and:

```text
https://divya-dhara.in/sitemap.xml
```

The sitemap should contain only valid production URLs.

---

## 🗺️ SPA Routing & Apache Deployment

Because Divya Dhara is a React SPA, Apache must redirect unknown frontend routes to `index.html`.

Example `.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    RewriteBase /

    # Disable MultiViews
    Options -MultiViews

    # Existing files and directories
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # React SPA fallback
    RewriteRule ^ index.html [L]
</IfModule>
```

This allows routes such as:

```text
/
 /about
 /temples
 /pilgrimage
 /gallery
 /blog
 /contact
```

to work correctly after direct browser access or page refresh.

---

## 🔐 HTTPS

Production should always use HTTPS:

```text
https://divya-dhara.in/
```

HTTP traffic should preferably redirect to HTTPS through the hosting/server configuration.

---

## 📱 Responsive Design

The website is designed to work across:

* Mobile phones
* Tablets
* Laptops
* Desktop computers
* Large displays

Important UI areas should remain usable without horizontal scrolling.

---

## 🎨 Design Principles

Divya Dhara follows a spiritual, elegant and premium visual direction.

Design priorities include:

* Clean layouts
* Strong visual hierarchy
* Comfortable typography
* Spiritual/cultural visual identity
* High-quality imagery
* Balanced whitespace
* Accessible navigation
* Subtle animations
* Responsive cards and sections
* Consistent buttons and interactive elements

Animations should enhance the experience without negatively affecting performance.

---

## 🖼️ Images & Media

Images should be:

* Optimized for web
* Properly sized
* Given meaningful `alt` attributes
* Compressed where possible
* Served in modern formats where practical

Avoid unnecessarily loading very large images on mobile devices.

---

## 📞 Contact & WhatsApp

The website can provide direct contact/enquiry functionality through:

* Contact forms
* WhatsApp
* Phone links
* Email links
* Google Maps/location information

WhatsApp links should open correctly on both mobile and desktop devices.

---

## 🧩 Reusable Components

Common website elements should be implemented as reusable React components.

Examples:

```text
Header
Navbar
Footer
Breadcrumbs
PageHero
SectionHeading
TempleCard
BlogCard
GalleryCard
ContactForm
WhatsAppButton
ScrollToTop
SEO
```

This keeps the codebase maintainable and avoids unnecessary duplication.

---

## 📄 Content Areas

The Divya Dhara website can organize content into areas such as:

### Home

Introduction to Divya Dhara with important spiritual and cultural highlights.

### About

Information about the purpose, vision and digital experience of Divya Dhara.

### Temples

Temple information, history, significance, location and related details.

### Pilgrimage

Important pilgrimage destinations and travel/spiritual information.

### Gallery

Images and visual content related to temples, festivals, spirituality and culture.

### Blog

Articles and informational content covering spiritual, cultural and pilgrimage topics.

### Contact

Contact information, enquiry forms, location/map and communication options.

---

## ⚡ Performance

The application should prioritize:

* Fast initial loading
* Lazy loading where appropriate
* Optimized images
* Code splitting where useful
* Minimal unnecessary JavaScript
* Reusable components
* Efficient API/data handling
* Avoiding unnecessary re-renders

Production builds should always be generated with:

```bash
npm run build
```

---

## 🧪 Pre-Deployment Checklist

Before uploading the project to production:

```text
✓ npm install
✓ npm run lint
✓ npx tsc --noEmit
✓ npm run build
✓ Check dist/
✓ Test homepage
✓ Test every route
✓ Test browser refresh on internal routes
✓ Test mobile layout
✓ Test desktop layout
✓ Test WhatsApp links
✓ Test contact forms
✓ Test images
✓ Test robots.txt
✓ Test sitemap.xml
✓ Check page titles
✓ Check meta descriptions
✓ Check canonical URLs
✓ Check HTTPS
✓ Check favicon
```

---

## 🚀 cPanel Deployment

After running:

```bash
npm run build
```

upload the **contents of the `dist` folder** to the website's public document root.

For example:

```text
public_html/
├── assets/
├── index.html
├── robots.txt
├── sitemap.xml
└── .htaccess
```

Do not upload the entire development project when only the static production build is required.

---

## 🔄 Deployment Workflow

Recommended workflow:

```text
Development
    ↓
Code Changes
    ↓
npm run lint
    ↓
npx tsc --noEmit
    ↓
npm run build
    ↓
Verify dist/
    ↓
Upload dist contents
    ↓
Configure .htaccess
    ↓
Enable HTTPS
    ↓
Test Production
    ↓
Google Search Console
```

---

## 🌐 Production Verification

After deployment, verify:

```text
https://divya-dhara.in/
https://divya-dhara.in/robots.txt
https://divya-dhara.in/sitemap.xml
```

Also test internal URLs directly in a fresh browser tab to confirm Apache SPA routing works correctly.

---

## 🔧 Environment Variables

If environment-specific configuration is required, use Vite environment variables.

Example:

```env
VITE_API_URL=
VITE_GOOGLE_MAPS_KEY=
```

Do not commit private API keys, passwords or other secrets to Git.

For Vite, only variables beginning with:

```text
VITE_
```

are exposed to client-side application code.

---

## 📌 Important Development Rules

* Use TypeScript for application code.
* Avoid unnecessary `any`.
* Keep components reusable.
* Keep SEO metadata unique per page.
* Use semantic HTML.
* Maintain responsive layouts.
* Optimize images before production.
* Do not hardcode localhost URLs in production.
* Do not expose private credentials.
* Test all routes after deployment.
* Keep accessibility in mind.
* Keep content original and meaningful.
* Avoid unnecessary dependencies.

---

## 📜 License

This project is proprietary software developed for the **Divya Dhara** website.

All website design, content, branding, graphics and custom application code are subject to their respective ownership and usage rights.

---

## ❤️ Divya Dhara

**Divya Dhara — A Digital Journey Through Spirituality, Culture & India**

Live Website:
https://divya-dhara.in/
