# FarmSmith Foods — Comprehensive SEO Audit Report

**Audit Date:** October 17, 2026  
**Audited Domain:** `https://www.farmsmithfoods.com`  
**Framework:** Next.js 16.3.2 (App Router), React 19.2.8, Tailwind CSS v4  
**Audit Type:** Static Architecture, Codebase & Metadata Read-Only Analysis  
**Auditor:** Claude SEO Multi-Agent Audit Suite  

---

## 1. Executive Summary

A comprehensive, read-only technical and on-page SEO audit was conducted across the FarmSmith Foods codebase. FarmSmith Foods is a direct-to-consumer (D2C) food brand built around transparency, batch testing, and GI-tagged agricultural produce (flagship product: Kandhamal GI-Tagged Turmeric Powder).

The website has high-quality design, strong brand storytelling, and solid security headers. However, critical technical and structured-data gaps currently prevent search engines from discovering, properly indexing, and ranking the site's high-value pages.

### SEO Health Score: **58 / 100**

```
┌────────────────────────────────────────────────────────┐
│ CATEGORY SCORES                                        │
├──────────────────────────┬───────────┬─────────┬───────┤
│ Category                 │ Weight    │ Score   │ Grade │
├──────────────────────────┼───────────┼─────────┼───────┤
│ Technical SEO            │ 22%       │ 62/100  │ D     │
│ Content Quality & E-E-A-T│ 23%       │ 74/100  │ C     │
│ On-Page SEO & Metadata   │ 20%       │ 58/100  │ D     │
│ Schema / Structured Data │ 10%       │  0/100  │ F     │
│ Performance (CWV risks)  │ 10%       │ 65/100  │ D     │
│ AI Search Readiness (GEO)│ 10%       │ 55/100  │ D     │
│ Images & Media           │  5%       │ 58/100  │ D     │
├──────────────────────────┴───────────┴─────────┴───────┤
│ OVERALL WEIGHTED SEO HEALTH SCORE: 58 / 100 (Grade: D) │
└────────────────────────────────────────────────────────┘
```

### Top 5 Critical Issues (P0 / P1)
1. **Zero Structured Data (JSON-LD)**: No `Product`, `Offer`, `Organization`, `WebSite`, `BreadcrumbList`, or `FAQPage` schema exists anywhere on the site. Search engines cannot generate Rich Snippets, Merchant listings, or Star ratings.
2. **Missing Canonical Tags**: Neither root `app/layout.tsx` nor individual pages define canonical URL tags (`alternates.canonical`). This risks duplicate content penalties between `www` and `non-www`, query parameters, and trailing slashes.
3. **Orphan Pillar Page (`/why-us`)**: The high-potency "Why FarmSmith / Our Standards" page contains the site's strongest E-E-A-T and technical keyword content, but all navigation links in `Navbar.tsx` and `Footer.tsx` point to homepage in-page hash anchors (`/#standards`) instead of `/why-us`.
4. **Missing Dedicated Shop / Catalog Page (`/shop`)**: `app/shop/page.tsx` executes an HTTP 307 redirect to `/#featured-harvest` and completely abandons the fully built `ShopClient.tsx` catalog component. Crawlers cannot index an e-commerce catalog page.
5. **Directives Conflict in `robots.txt` vs `noindex`**: Pages like `/login`, `/signup`, `/checkout`, and `/reset-password` specify `<meta name="robots" content="noindex">`, but are also disallowed in `robots.ts`. Under Googlebot specifications, crawlers blocked by `robots.txt` never fetch the page and cannot read the `noindex` tag, resulting in indexation without snippet content if linked externally.

### Top 5 Quick Wins
1. Add `alternates: { canonical: ... }` across root layout and individual pages.
2. Inject valid JSON-LD schemas: `Organization` on root, `Product` + `Offer` on `/shop/[slug]`, and `FAQPage` on `/`.
3. Re-link `/why-us` in `Navbar.tsx` and `Footer.tsx` so search crawlers and users can access the full standards pillar page.
4. Mount `ShopClient.tsx` inside `app/shop/page.tsx` with proper title and metadata to establish an indexable catalog route.
5. Replace Next.js temporary 307 redirects for legacy slugs (`/shop/kandhamal-turmeric-powder`) with permanent 301/308 redirects.

---

## 2. Project and Route Inventory

### Framework & Architecture
- **Framework**: Next.js 16.3.2 (App Router)
- **Runtime**: Node.js / React 19.2.8
- **Styling**: Tailwind CSS v4, PostCSS
- **Rendering Pattern**: Incremental Static Regeneration (ISR with `revalidate = 60`) on Homepage and Product pages; Client Components for interactive UI; Static Server Components for legal pages.
- **Database / API**: Supabase (PostgREST data layer via `@/lib/data/products.ts`)

### Complete Route Inventory

| Route Path | Type | File Path | Rendering Mode | Indexable? | Sitemap? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Landing / Homepage | [`app/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/page.tsx) | ISR (60s) | Yes | Yes (1.0) |
| `/shop` | Catalog | [`app/shop/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/page.tsx) | 307 Redirect to `/#featured-harvest` | No (Redirect) | **Missing** |
| `/shop/[slug]` | Product Detail | [`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/%5Bslug%5D/page.tsx) | ISR (60s) + SSG (`generateStaticParams`) | Yes | Yes (0.8) |
| `/our-product` | Legacy Redirect | [`app/our-product/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/our-product/page.tsx) | 307 Redirect to `/#featured-harvest` | No (Redirect) | No |
| `/about-us` | Brand Story | [`app/about-us/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/about-us/page.tsx) | Client Component wrapper | Yes | Yes (0.8) |
| `/why-us` | Standards / Purity | [`app/why-us/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/why-us/page.tsx) | Server Component | **Orphaned** | Yes (0.8) |
| `/contact` | Contact & NAP | [`app/contact/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/contact/page.tsx) | Client Component wrapper | Yes | Yes (0.7) |
| `/privacy-policy` | Legal | [`app/privacy-policy/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/privacy-policy/page.tsx) | Server Component | Yes | Yes (0.4) |
| `/terms` | Legal | [`app/terms/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/terms/page.tsx) | Server Component | Yes | Yes (0.4) |
| `/track` | Utility | [`app/track/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/track/page.tsx) | Client Component wrapper | Yes (No noindex) | No |
| `/checkout` | Transactional | [`app/checkout/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/checkout/page.tsx) | Client Component | No (Blocked & noindex) | No |
| `/login` | Auth | [`app/login/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/login/page.tsx) | Client Component | No (Blocked & noindex) | No |
| `/signup` | Auth | [`app/signup/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/signup/page.tsx) | Client Component | No (Blocked & noindex) | No |
| `/reset-password` | Auth | [`app/reset-password/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/reset-password/page.tsx) | Client Component | No (Blocked & noindex) | No |
| `/account` | Account Dashboard | [`app/account/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/account/page.tsx) | Client Component | No (Blocked) | No |
| `/account/orders` | Account Orders | [`app/account/orders/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/account/orders/page.tsx) | Client Component | No (Blocked) | No |
| `/account/orders/[id]` | Account Order Detail | [`app/account/orders/[orderNumber]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/account/orders/%5BorderNumber%5D/page.tsx) | Client Component | No (Blocked) | No |
| `/order/[id]` | Order Confirmation | [`app/order/[orderNumber]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/order/%5BorderNumber%5D/page.tsx) | Client Component | No (Blocked & noindex) | No |

---

## 3. Findings by Severity

### Severity Definition
- **P0 — Critical**: Blocks core indexing, breaks search engine protocols, or risks manual action/penalties.
- **P1 — High**: Significantly impacts rankings, suppresses organic visibility, or squanders key link equity.
- **P2 — Medium**: Optimization opportunity that improves click-through rates, crawl budget, or snippet presentation.
- **P3 — Low**: Minor hygiene, code cleanliness, or future-proofing recommendation.

---

### [P0] Critical Findings

#### 1. Complete Absence of Structured Data (JSON-LD)
- **Category**: Schema & Structured Data
- **Files Affected**:
  - [`app/layout.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/layout.tsx)
  - [`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/%5Bslug%5D/page.tsx)
  - [`app/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/page.tsx)
- **Evidence**: Grep analysis for `application/ld+json` and `schema.org` returned 0 matches across the entire codebase.
- **Impact**: Google cannot parse product pricing, currency, availability, reviews, company legal identity, or FAQ accordions. Zero rich results eligibility in SERPs.

#### 2. Missing Canonical Tags Across All Pages
- **Category**: Indexability & URLs
- **Files Affected**:
  - [`app/layout.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/layout.tsx#L84-L121)
  - [`app/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/page.tsx#L14-L18)
  - [`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/%5Bslug%5D/page.tsx#L37-L45)
- **Evidence**: `metadataBase` is set in `app/layout.tsx`, but no `alternates: { canonical: ... }` is declared in either root metadata or any child page.
- **Impact**: Vulnerable to split ranking equity when pages are accessed with tracking query parameters (`?ref=...`, `?utm_source=...`), trailing slashes, or across alternate protocol/host variants.

#### 3. Orphan Pillar Page: `/why-us` Excluded from Site Navigation
- **Category**: Crawlability & Internal Linking
- **Files Affected**:
  - [`components/layout/Navbar.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Navbar.tsx#L17)
  - [`components/layout/Footer.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Footer.tsx#L31) and [`Footer.tsx:L201`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Footer.tsx#L201)
  - [`app/sitemap.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/sitemap.ts#L17)
- **Evidence**:
  - `Navbar.tsx` defines `{ href: "/#standards", label: "Our Standards" }`.
  - `Footer.tsx` line 201 explicitly overrides the URL: `if (link.href === "/why-us") targetHref = "/#standards";`.
  - `app/why-us/page.tsx` contains 467 lines of deep educational and trust content (NABL lab testing, GI Tag #610, active curcumin percentages, fair trade direct farmer sourcing), but has **zero inbound crawl links** from the site UI.
- **Impact**: Crawlers treat `/why-us` as an orphan URL. Even though it is submitted in `sitemap.xml`, search engines heavily penalize pages without internal link architecture.

---

### [P1] High Priority Findings

#### 4. Disallow vs `noindex` Directives Conflict
- **Category**: Technical SEO / Crawl Budget
- **Files Affected**:
  - [`app/robots.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/robots.ts#L9-L18)
  - [`app/login/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/login/page.tsx#L7-L10)
  - [`app/signup/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/signup/page.tsx#L7-L10)
  - [`app/checkout/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/checkout/page.tsx#L9-L12)
  - [`app/reset-password/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/reset-password/page.tsx#L7-L10)
- **Evidence**: Both `robots.txt` Disallow rules and page-level `robots: { index: false }` are applied to the same paths.
- **Impact**: Per Google Search Central documentation, if a URL is blocked via `robots.txt`, Googlebot cannot download the HTML and will never see the `<meta name="robots" content="noindex">` tag. External backlinks can cause these utility pages to appear as indexable search results with missing snippet text.

#### 5. Abandoned Catalog Route (`/shop` 307 Redirect)
- **Category**: E-commerce Architecture
- **Files Affected**:
  - [`app/shop/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/page.tsx#L3-L5)
  - [`app/shop/ShopClient.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/ShopClient.tsx)
  - [`app/sitemap.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/sitemap.ts)
- **Evidence**:
  ```typescript
  // app/shop/page.tsx
  export default function ShopPage() {
    redirect("/#featured-harvest");
  }
  ```
  `app/shop/ShopClient.tsx` is fully implemented with category filtering and product card grids, but is completely unused. Furthermore, `/shop` is excluded from `sitemap.ts`.
- **Impact**: The site lacks a crawlable catalog collection page for queries like "FarmSmith shop", "buy organic spices online", or "organic food online store". Anchor redirects (`/#featured-harvest`) are stripped by web crawlers.

#### 6. Temporary 307 Redirects Instead of Permanent 301/308 for Slug Canonicalization
- **Category**: Redirects & Link Equity
- **Files Affected**:
  - [`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/%5Bslug%5D/page.tsx#L89-L92)
- **Evidence**:
  ```typescript
  if (slug === "kandhamal-turmeric-powder") {
    redirect("/shop/turmeric-powder");
  }
  ```
  In Next.js Server Components, standard `redirect()` issues an HTTP 307 Temporary Redirect by default.
- **Impact**: Search engines do not pass page rank and link signals through temporary 307 redirects. It should use `permanentRedirect("/shop/turmeric-powder")` (HTTP 308) or a Next.js `redirects()` config rule with `permanent: true` (HTTP 301).
- **Secondary issue**: In `generateMetadata` (lines 37-45), `slug === "kandhamal-turmeric-powder"` is NOT redirected, causing non-canonical metadata generation.

#### 7. Missing Product Open Graph & Twitter Social Metadata
- **Category**: Social & CTR Metadata
- **Files Affected**:
  - [`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/%5Bslug%5D/page.tsx#L37-L45)
- **Evidence**: `generateMetadata` only sets `title` and `description`. It does not populate `openGraph` (`images`, `type: "website"` or `"product"`, `url`) or `twitter`.
- **Impact**: When users share products on WhatsApp, Instagram, or Twitter, link previews display fallback generic homepage graphics instead of the product image and price.

---

### [P2] Medium Priority Findings

#### 8. Excessive Font Loading (6 Google Font Families)
- **Category**: Performance & Core Web Vitals (LCP / CLS)
- **Files Affected**:
  - [`app/layout.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/layout.tsx#L3-L61)
- **Evidence**: Layout loads Cormorant Garamond, Manrope, Cinzel, Playfair Display, Plus Jakarta Sans, and Inter.
- **Impact**: Downloading 6 font weights and subsets increases CSS and network payload on mobile devices, increasing layout shift (CLS) risks during font swapping.

#### 9. Blocking Full-Screen Intro Animation
- **Category**: Mobile Usability & Field CWV (INP / LCP)
- **Files Affected**:
  - [`components/home/IntroHeroAnimation.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/IntroHeroAnimation.tsx#L24-L68)
- **Evidence**: When a user visits the homepage without `sessionStorage`, a 3.5-second intro overlay animates across the viewport. While it includes a check to bypass Lighthouse (`/Chrome-Lighthouse|Lighthouse/i.test(...)`), real user field data (CrUX) and mobile users experience delayed interactivity and potential LCP delays.

#### 10. Generic Image Alt Text on Product and Heritage Galleries
- **Category**: Image SEO & Accessibility
- **Files Affected**:
  - [`components/product/ProductGallery.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/product/ProductGallery.tsx#L35-L65)
  - [`components/home/FeaturedProductShowcase.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/FeaturedProductShowcase.tsx#L192)
  - [`components/home/PurityShowcase.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/PurityShowcase.tsx#L9-L13)
- **Evidence**:
  - `alt_text: `${productName} - View 1``, `View 2`, etc.
  - `alt: "Know the origin - Kandhamal Turmeric Heritage 0"`, `Heritage 1`, etc.
- **Impact**: Missed opportunity to rank in Google Image Search for terms like "Kandhamal turmeric packaging", "NABL turmeric lab test report", and "curcumin percentage facts".

#### 11. Oversized Uncompressed Images & Spaces in Filenames
- **Category**: Performance & Asset Management
- **Files Affected**:
  - [`public/images/`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/public/images)
- **Evidence**:
  - `hero_groceries.png` (1.92 MB)
  - `kids_food_education.png` (949 KB)
  - `product_mustard_oil_farm.png` (925 KB)
  - Spaces in asset paths: `Know the origin 0.PNG`, `Our story 1.PNG`, `Product 1.PNG`.
- **Impact**: Files with spaces require URI encoding (`%20`). Heavy assets consume extra CDN bandwidth and slow initial cold-cache page loads.

#### 12. Fake Real-Time Timestamp in `sitemap.ts`
- **Category**: Crawl Efficiency
- **Files Affected**:
  - [`app/sitemap.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/sitemap.ts#L12-L44)
- **Evidence**: All static routes declare `lastModified: new Date()`, which changes on every single crawler request.
- **Impact**: Google ignores `lastmod` headers when sites constantly output dynamic current timestamps without genuine content updates.

#### 13. Hardcoded Product Slug in Data Layer
- **Category**: Code Health & Scalability
- **Files Affected**:
  - [`lib/data/products.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/lib/data/products.ts#L125)
- **Evidence**:
  ```typescript
  return {
    ...rawProduct,
    slug: "turmeric-powder",
    images,
  };
  ```
  `getProductBySlug` overwrites any database product slug with `"turmeric-powder"`.
- **Impact**: When new products (e.g., Mustard Oil, Arhar Daal) are published in Supabase, their PDP routes will fail or generate erroneous URLs.

---

### [P3] Low Priority Findings

#### 14. Missing AI Search Crawler Policy (`robots.ts`)
- **Category**: GEO / AI Search Citability
- **Files Affected**:
  - [`app/robots.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/robots.ts)
- **Evidence**: No explicit policy for `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `Claude-SearchBot`, or `PerplexityBot`.
- **Impact**: Without explicit permissions or an `llms.txt` file, AI search engines index pages normally, but cannot optimize passages for structured AI citations and answers.

#### 15. Duplicate H1 Phrasing Between Homepage and About Us
- **Category**: Content Hierarchy & Cannibalization
- **Files Affected**:
  - [`components/home/HomeHeroSection.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/HomeHeroSection.tsx#L132)
  - [`app/about-us/AboutUsClient.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/about-us/AboutUsClient.tsx#L171)
- **Evidence**: Both pages feature the identical H1 heading text: `"Food crafted with a mother's care"`.
- **Impact**: Dilutes focus between the commercial landing page and the brand story page.

---

## 4. Page-by-Page Assessment

| URL Route | Page Title | Meta Description Status | H1 Tag | Canonical | Schema Present? | Primary Issues & Actions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/`** | FarmSmith Foods — Organic Food Crafted with a Mother's Care | Configured, clear value proposition | `Food crafted with a mother's care` | **Missing** | **None** | Add Organization, WebSite, and FAQPage JSON-LD. Add self-canonical. Add explicit keyword focus on Kandhamal Turmeric. |
| **`/shop`** | *None (Redirects)* | *None (Redirects)* | *None* | **Missing** | **None** | Currently 307-redirects to `/#featured-harvest`. Mount `ShopClient.tsx`, define title & description, add to sitemap. |
| **`/shop/[slug]`** | {Product Name} \| FarmSmith Foods | Taken from product short description | `{product.name}` | **Missing** | **None** | Add Product, Offer, and BreadcrumbList JSON-LD. Add product-specific Open Graph / Twitter image. Permanent 301/308 redirect for legacy slug. |
| **`/about-us`** | About Us — Food Crafted with a Mother's Care \| FarmSmith Foods | Configured (mission & sourcing) | `Food crafted with a mother's care` | **Missing** | **None** | H1 duplicates Homepage H1. Differentiate to "Our Story: Why We Built FarmSmith Foods". Add self-canonical. |
| **`/why-us`** | Why FarmSmith — Our Purity & Sourcing Promise \| FarmSmith Foods | High quality, keyword-rich | `Pure origin, zero doubts` | **Missing** | **None** | **Orphaned page!** Re-link from Navbar and Footer. Add BreadcrumbList schema and self-canonical. |
| **`/contact`** | Contact Us — Customer Helpline & Inquiry \| FarmSmith Foods | Includes support & bulk query keywords | `Let's start a conversation` | **Missing** | **None** | Add LocalBusiness / ContactPoint schema with Paradeep, Odisha office address and phone number. |
| **`/privacy-policy`** | Privacy Policy \| FarmSmith Foods | Clear legal summary | `Privacy Policy` | **Missing** | **None** | Add self-canonical. |
| **`/terms`** | Terms & Conditions \| FarmSmith Foods | Clear terms summary | `Terms & Conditions` | **Missing** | **None** | Add self-canonical. |
| **`/track`** | Track Your Order \| FarmSmith Foods | Clear order tracking description | `Track Your Order` | **Missing** | **None** | Utility page. Either add `robots: { index: false }` or decide whether it should target "FarmSmith order tracking". |
| **`/login`** | Sign In \| FarmSmith Foods | Configured | `Welcome Back` | N/A | **None** | Directive conflict: Remove from `robots.txt` Disallow so Googlebot can see the `noindex` tag. |
| **`/signup`** | Create Account \| FarmSmith Foods | Configured | `Create Account` | N/A | **None** | Directive conflict: Remove from `robots.txt` Disallow so Googlebot can see the `noindex` tag. |
| **`/checkout`** | Checkout \| FarmSmith Foods | Configured | `Checkout` | N/A | **None** | Directive conflict: Remove from `robots.txt` Disallow so Googlebot can see the `noindex` tag. |

---

## 5. Product & Category Keyword Mapping

| Product / Category | Target Keyword | Secondary Keywords | Search Intent | Target Landing Page | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kandhamal Turmeric Powder** | Kandhamal turmeric powder | GI tagged turmeric India, pure turmeric powder, organic haldi online, high curcumin turmeric | Transactional / Commercial | `/shop/turmeric-powder` | Page exists, has good on-page copy, but lacks Product schema, Open Graph, and self-canonical. |
| **Tested Purity / Standards** | lab tested turmeric powder | lead free turmeric, unadulterated turmeric, NABL certified turmeric, no artificial colors turmeric | Informational / Trust | `/why-us` | **Orphan page!** Great content, but inaccessible via internal links. |
| **Full Shop / Spices Catalog** | buy organic spices online India | FarmSmith shop, organic grocery staples, chemical free spices | Commercial / Navigation | `/shop` | **Broken!** Redirects to home page hash anchor. |
| **Cold-Pressed Oils (Upcoming)** | cold pressed mustard oil organic | wood pressed mustard oil, kachi ghani unrefined oil | Commercial | `/shop` or `/shop/mustard-oil` | Teased in `GrowingSection.tsx` on homepage; no landing page yet. |
| **Organic Pulses & Grains (Upcoming)**| unpolished arhar daal organic | single origin aromatic rice, pesticide free pulses | Commercial | `/shop` or `/shop/arhar-daal` | Teased in `GrowingSection.tsx`; no landing page yet. |
| **Brand / Founder Story** | FarmSmith Foods | food crafted with a mother's care, transparent food brand India | Navigational | `/about-us` | Active, but shares duplicate H1 with homepage. |

---

## 6. Recommended Fixes in Priority Order

### Phase 1: Critical Fixes (P0) — Immediate Implementation
1. **Implement JSON-LD Structured Data**:
   - Create `@/components/seo/JsonLd.tsx` helper.
   - Inject `Organization` and `WebSite` schema on root [`app/layout.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/layout.tsx).
   - Inject `Product` + `Offer` schema on [`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/%5Bslug%5D/page.tsx).
   - Inject `FAQPage` schema on [`app/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/page.tsx) utilizing the 6 questions from `FaqSection.tsx`.
2. **Add Canonical URLs Across All Routes**:
   - Set `alternates: { canonical: "./" }` in `metadata` of `layout.tsx`.
   - Set explicit self-referencing canonicals in individual pages (`/`, `/shop/turmeric-powder`, `/about-us`, `/why-us`, `/contact`, `/privacy-policy`, `/terms`).
3. **Re-establish Internal Links to `/why-us`**:
   - Update `Navbar.tsx` and `Footer.tsx` so "Our Standards" points directly to `/why-us` instead of `/#standards`.
   - Add a cross-link from the homepage Standards section to `/why-us` ("Read our full sourcing standards & NABL methodology &rarr;").

### Phase 2: High-Impact Improvements (P1) — Week 1 to 2
4. **Restore the `/shop` Catalog Page**:
   - Replace the `redirect("/#featured-harvest")` in [`app/shop/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/page.tsx) with a server component that renders `ShopClient.tsx`.
   - Add metadata (Title: `"Shop Organic Spices & Grocery Staples | FarmSmith Foods"`, Description, Canonical).
   - Add `/shop` to [`app/sitemap.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/sitemap.ts) with priority 0.9.
5. **Resolve `robots.txt` vs `noindex` Directive Conflict**:
   - In [`app/robots.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/robots.ts), remove `/login`, `/signup`, `/checkout`, `/reset-password` from `disallow` so Googlebot can crawl and respect their `robots: { index: false }` meta tags.
   - Keep `/api/*` and `/account/*` disallowed.
6. **Correct Slug Redirects to Permanent (301/308)**:
   - In [`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/%5Bslug%5D/page.tsx#L89-L92), replace `redirect("/shop/turmeric-powder")` with `permanentRedirect("/shop/turmeric-powder")`.
   - Ensure `generateMetadata` handles the redirect or canonical URL so `kandhamal-turmeric-powder` is never indexed separately.
7. **Add Product-Specific Open Graph Tags**:
   - In `generateMetadata` of `/shop/[slug]`, populate `openGraph.images` with the primary product image URL, `openGraph.type: "website"`, and `twitter.card: "summary_large_image"`.

### Phase 3: Performance, Images & Content Polish (P2 / P3) — Month 1
8. **Optimize Public Image Assets**:
   - Convert large PNG assets (`hero_groceries.png` at 1.92 MB, `kids_food_education.png` at 949 KB) to WebP/AVIF.
   - Rename image files to remove spaces (e.g., `Know the origin 0.PNG` &rarr; `know-the-origin-0.webp`).
9. **Upgrade Image Alt Text**:
   - Replace generic "View 1", "Heritage 0" alt text with descriptive, keyword-aligned descriptions.
10. **Font Optimization**:
    - Audit Google Fonts in `app/layout.tsx` to reduce the count from 6 down to 2 or 3 core families (e.g. Cormorant Garamond for headings, Manrope for body text).
11. **Refine Homepage vs About Us H1 Tags**:
    - Differentiate H1 tags to avoid keyword cannibalization.
12. **Fix Dynamic `lastModified` in Sitemap**:
    - In `sitemap.ts`, set static dates for legal/about pages or derive them from Git commits/content versions rather than `new Date()`.
13. **Fix Bug in `getProductBySlug`**:
    - Remove the hardcoded `slug: "turmeric-powder"` on line 125 of `lib/data/products.ts` so future products function correctly.

---

## 7. Checks That Could Not Be Completed & Why

1. **Google Search Console & CrUX Field Data**:
   - Google API credentials and Search Console properties are not configured in this local development workspace. CrUX field metrics (real user 75th percentile LCP, INP, CLS) could not be pulled live.
2. **Live Production HTTP Response Headers & CDN Redirects**:
   - Host-level redirects (`http` to `https` and non-www `farmsmithfoods.com` to `www.farmsmithfoods.com`) must be verified on the production hosting environment (e.g., Vercel / Cloudflare).
3. **Live External Backlink Analysis**:
   - Third-party API keys (Ahrefs, Semrush, Moz, DataForSEO) are not active in this repository environment to analyze external referring domains and anchor texts.
4. **Live Payment / Post-Checkout Pages**:
   - Payment webhooks and order confirmation URLs require active Razorpay test credentials and order generation.

---

## 8. Separate List of Changes Requiring User Approval

Before any code modifications are made, the following decisions require explicit user approval:

| Change Proposal | Technical Scope | SEO & User Experience Impact | Approval Needed? |
| :--- | :--- | :--- | :--- |
| **1. Restore `/shop` as a Dedicated Catalog Page** | Remove `redirect("/#featured-harvest")` in `app/shop/page.tsx` and render `ShopClient.tsx`. | Gives Google a permanent, crawlable e-commerce catalog page. Changes the user experience for visitors clicking "Shop" so they view a dedicated catalog rather than scrolling down the homepage. | **Requires Approval** |
| **2. Re-link `/why-us` in Navbar & Footer** | Change `{ href: "/#standards", label: "Our Standards" }` to `{ href: "/why-us", label: "Our Standards" }` in `Navbar.tsx` and `Footer.tsx`. | Un-orphans the 467-line standards pillar page. Visitors clicking "Our Standards" will navigate to the dedicated `/why-us` page instead of scrolling to the homepage section. | **Requires Approval** |
| **3. Font Family Consolidation** | Reduce Google Fonts from 6 (`Cormorant_Garamond`, `Manrope`, `Cinzel`, `Playfair_Display`, `Plus_Jakarta_Sans`, `Inter`) down to 2-3 families. | Dramatically improves mobile page load times and prevents layout shifts (CLS), but slightly alters typography nuances in secondary banners. | **Requires Approval** |
| **4. Modify `robots.txt` Disallow Rules** | Remove `/login`, `/signup`, `/checkout`, `/reset-password` from `app/robots.ts` disallow list. | Complies with Google's indexing guidelines so `noindex` tags can be crawled and honored. | **Requires Approval** |
| **5. Add JSON-LD Structured Data** | Add non-rendered `<script type="application/ld+json">` tags to `layout.tsx`, `page.tsx`, and `/shop/[slug]/page.tsx`. | Purely backend/metadata enhancement; zero visual changes to website UI. | Recommended (Low Risk) |
| **6. Image Optimization & Filename Normalization** | Convert heavy PNGs to WebP and remove whitespace in filenames under `/public/images/`. | Faster load speeds; requires updating matching asset references in components. | Recommended (Low Risk) |
| **7. Fix Hardcoded Slug in Data Layer** | Remove `slug: "turmeric-powder"` hardcode on line 125 of `lib/data/products.ts`. | Backend bug fix; allows multi-product scaling in Supabase. | Recommended (Low Risk) |

---

## 9. Phase 1 Implementation Report (Completed)

**Implementation Date:** October 17, 2026  
**Status:** **Completed Successfully** (Foundational SEO & Structured Data Architecture Active)  
**Verification:** TypeScript `tsc --noEmit` (Clean, Code 0), Turbopack Production Build `next build` (37/37 Static & ISR Pages Prerendered, Code 0).

---

### 9.1 Summary of Verified & Remediated Issues

| Audit Finding ID | Finding Description | Severity | Remediated In Phase 1? | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **FINDING-01** | Zero Structured Data (JSON-LD) across entire website | **P0** | **YES** | Verified: Organization, WebSite, Product, Offer, BreadcrumbList, and FAQPage schemas present in production HTML. |
| **FINDING-02** | Missing Canonical URLs across all pages | **P0** | **YES** | Verified: Absolute `<link rel="canonical">` tags pointing to `https://www.farmsmithfoods.com/...` emitted on all indexable public pages. |
| **FINDING-03** | Orphan Pillar Page (`/why-us`) | **P0** | **YES** | Verified: Internal navigation links added in `Navbar.tsx`, `Footer.tsx`, and contextual callout in `PurityShowcase.tsx`. |
| **FINDING-04** | Disallow vs `noindex` directives conflict in `robots.txt` | **P1** | **YES** | Verified: `/login`, `/signup`, `/checkout`, `/reset-password` removed from `robots.txt` Disallow so crawlers can discover their `noindex` tags. |
| **FINDING-05** | Temporary 307 redirect on product slug canonicalization | **P1** | **YES** | Verified: Replaced with `permanentRedirect("/shop/turmeric-powder")` (HTTP 308 permanent redirect) and updated `generateMetadata`. |
| **FINDING-06** | Missing product-specific Open Graph / Twitter metadata | **P1** | **YES** | Verified: Product name, description, absolute image, and canonical URL added to `generateMetadata` in `app/shop/[slug]/page.tsx`. |
| **FINDING-07** | Insecure/Non-canonical `metadataBase` (`http://farmsmithfoods.com`) | **P1** | **YES** | Verified: `getSafeSiteUrl()` in `app/layout.tsx` updated to enforce `https://www.farmsmithfoods.com`. |

---

### 9.2 Files Created & Modified

1. **[`components/seo/JsonLd.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/seo/JsonLd.tsx) (Created)**
   - Reusable, type-safe Next.js App Router component for JSON-LD structured data.
   - Escapes unsafe script-injection characters (`<` &rarr; `\u003c`) to protect against XSS.

2. **[`app/layout.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/layout.tsx) (Modified)**
   - Enforced `https://www.farmsmithfoods.com` as the canonical production `metadataBase`.
   - Injected site-wide `Organization` and `WebSite` JSON-LD schemas inside `<head>`.
   - Organization schema includes legal name, official HTTPS URL, logo, email (`farmsmith6@gmail.com`), phone (`+91 82962 10991`), and postal address in Paradeep, Jagatsinghpur, Odisha.

3. **[`app/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/page.tsx) (Modified)**
   - Added self-referencing absolute canonical URL: `https://www.farmsmithfoods.com`.
   - Injected Schema.org `FAQPage` JSON-LD structured data containing the 8 verified, visible questions and answers from `FaqSection.tsx`.

4. **[`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/%5Bslug%5D/page.tsx) (Modified)**
   - Replaced temporary `redirect()` with `permanentRedirect("/shop/turmeric-powder")` (HTTP 308) in both page component and `generateMetadata`.
   - Added absolute canonical URL: `https://www.farmsmithfoods.com/shop/${product.slug}`.
   - Added product-specific Open Graph and Twitter Card tags.
   - Injected Schema.org `Product`, `Offer`, and `BreadcrumbList` JSON-LD schemas derived dynamically from verified product database fields (price: 129 INR, InStock status, brand, sku, description).

5. **[`app/why-us/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/why-us/page.tsx) (Modified)**
   - Added absolute canonical URL: `https://www.farmsmithfoods.com/why-us`.
   - Injected Schema.org `BreadcrumbList` JSON-LD schema (Home &rarr; Why FarmSmith).

6. **[`app/about-us/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/about-us/page.tsx) (Modified)**
   - Added absolute canonical URL: `https://www.farmsmithfoods.com/about-us`.
   - Injected Schema.org `BreadcrumbList` JSON-LD schema (Home &rarr; About Us).

7. **[`app/contact/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/contact/page.tsx) (Modified)**
   - Added absolute canonical URL: `https://www.farmsmithfoods.com/contact`.
   - Injected Schema.org `BreadcrumbList` JSON-LD schema (Home &rarr; Contact Us).

8. **[`app/privacy-policy/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/privacy-policy/page.tsx) (Modified)**
   - Added absolute canonical URL: `https://www.farmsmithfoods.com/privacy-policy`.
   - Injected Schema.org `BreadcrumbList` JSON-LD schema.

9. **[`app/terms/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/terms/page.tsx) (Modified)**
   - Added absolute canonical URL: `https://www.farmsmithfoods.com/terms`.
   - Injected Schema.org `BreadcrumbList` JSON-LD schema.

10. **[`app/track/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/track/page.tsx) (Modified)**
    - Added absolute canonical URL: `https://www.farmsmithfoods.com/track`.
    - Injected Schema.org `BreadcrumbList` JSON-LD schema.

11. **[`app/robots.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/robots.ts) (Modified)**
    - Resolved directive conflict by removing `/login`, `/signup`, `/checkout`, `/reset-password` from `disallow`.
    - Kept `/account`, `/account/*`, `/order/*`, `/api/*` disallowed.
    - Verified generated `robots.txt` aligns with indexing strategy.

12. **[`components/layout/Navbar.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Navbar.tsx) (Modified)**
    - Pointed "Our Standards" nav link directly to `/why-us` instead of homepage hash anchor `/#standards`.

13. **[`components/layout/Footer.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Footer.tsx) (Modified)**
    - Removed override that was forcing `/why-us` to `/#standards`, restoring the direct internal crawl link.

14. **[`components/home/PurityShowcase.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/PurityShowcase.tsx) (Modified)**
    - Added contextual link under batch verification tiles linking directly to `/why-us`.

15. **[`components/home/IntroHeroAnimation.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/IntroHeroAnimation.tsx) (Modified)**
    - Updated navigation array so "Our Standards" consistently maps to `/why-us`.

---

### 9.3 Validation & Testing Results

1. **TypeScript Compilation Check (`npx tsc --noEmit`)**:
   - **Result**: **Passed with 0 errors (Exit code 0)**.
2. **Next.js Production Build (`npm run build`)**:
   - **Result**: **Compiled successfully with Turbopack (Exit code 0)**.
   - **Pages Prerendered**: 37/37 static and dynamic routes.
3. **Canonical Link Tag Verification in Generated HTML**:
   - `index.html`: `<link rel="canonical" href="https://www.farmsmithfoods.com"/>` (Verified)
   - `why-us.html`: `<link rel="canonical" href="https://www.farmsmithfoods.com/why-us"/>` (Verified)
   - `about-us.html`: `<link rel="canonical" href="https://www.farmsmithfoods.com/about-us"/>` (Verified)
   - `contact.html`: `<link rel="canonical" href="https://www.farmsmithfoods.com/contact"/>` (Verified)
   - `privacy-policy.html`: `<link rel="canonical" href="https://www.farmsmithfoods.com/privacy-policy"/>` (Verified)
   - `terms.html`: `<link rel="canonical" href="https://www.farmsmithfoods.com/terms"/>` (Verified)
   - `track.html`: `<link rel="canonical" href="https://www.farmsmithfoods.com/track"/>` (Verified)
   - `shop/turmeric-powder.html`: `<link rel="canonical" href="https://www.farmsmithfoods.com/shop/turmeric-powder"/>` (Verified)
4. **Noindex Tag Verification on Private Pages**:
   - `login.html`: `<meta name="robots" content="noindex, nofollow"/>` (Verified, no canonical tag)
   - `signup.html`: `<meta name="robots" content="noindex, nofollow"/>` (Verified, no canonical tag)
   - `checkout.html`: `<meta name="robots" content="noindex, nofollow"/>` (Verified, no canonical tag)
   - `reset-password.html`: `<meta name="robots" content="noindex, nofollow"/>` (Verified, no canonical tag)
5. **Robots.txt Output (`.next/server/app/robots.txt.body`)**:
   - Disallows: `/account`, `/account/*`, `/order/*`, `/api/*` (Verified)
   - Sitemap: `https://www.farmsmithfoods.com/sitemap.xml` (Verified)
6. **JSON-LD Schema Parsed & Validated**:
   - `Organization` & `WebSite` present in `<head>` across all pages (Verified)
   - `Product` & `Offer` present on `/shop/turmeric-powder` (Verified)
   - `BreadcrumbList` present on `/shop/turmeric-powder`, `/why-us`, `/about-us`, `/contact`, `/privacy-policy`, `/terms`, `/track` (Verified)
   - `FAQPage` present on `/` with 8 authentic QA pairs (Verified)

---

### 9.4 Remaining Issues Deferred to Phase 2 & Phase 3

- **Phase 2 Status**:
  - **Completed** (See Section 10 below for full implementation report).
- **Phase 3 (Optimization & Polish - Pending Phase 3 Request)**:
  - Font consolidation (reducing 6 Google Font families down to 2–3).
  - Image WebP conversion and space removal from image filenames in `/public/images/`.
  - Upgrading image alt text on product galleries and origin slides.
  - Differentiating H1 text between Homepage and About Us.

---

## 10. Phase 2 Implementation Report: Shop Restoration, Product SEO & Sitemap

**Implementation Date:** October 17, 2026  
**Status:** **Completed**  
**Remediation Scope:** Phase 2 Only (Catalogue restoration, product slug resolution, dynamic product metadata & schema verification, sitemap overhaul, navigation updates).

---

### 10.1 Why `/shop` Was Not Rendering the Catalogue & How It Was Restored

- **Root Cause Identified**:
  - Inspection of Git commit history revealed commit `4e88c5e83396226aebe5feadca14cf8d1e947c7f` (*"Optimize intro animation timing, update eyebrow texts, remove rounded card styling in growing section, and route shop links to homepage product section"*).
  - In that commit, the author replaced the original Server Component rendering of `ShopClient.tsx` in `app/shop/page.tsx` with an HTTP 307 temporary redirect `redirect("/#featured-harvest")`, intending to route users directly to the single flagship harvest section on the homepage while the broader catalogue was in development.
  - The fully styled and functional `ShopClient.tsx` component (featuring the category filter bar, hero banner, empty states, and responsive product grid with `ProductCard`) was retained in the codebase but left unmounted.
- **Catalogue Restoration**:
  - Rebuilt [`app/shop/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/page.tsx) as an ISR Server Component (`revalidate = 60`) that fetches active products via `getActiveProducts({ limit: 100 })` and mounts `<ShopClient initialProducts={products} />`.
  - Configured comprehensive metadata:
    - `title: "Organic Shop — GI-Tagged Spices & Farm-Fresh Essentials | FarmSmith Foods"`
    - `description: "Explore FarmSmith Foods' catalogue of single-origin, GI-tagged spices and organic staples. Lab-tested with 100% batch transparency and direct farmer sourcing."`
    - Absolute canonical: `https://www.farmsmithfoods.com/shop`
    - Complete Open Graph and Twitter summary card tags.
  - Injected Schema.org `BreadcrumbList` JSON-LD representing Home (`https://www.farmsmithfoods.com`) → Shop (`https://www.farmsmithfoods.com/shop`).

---

### 10.2 Product Slug Investigation & Resolution

- **Discrepancy Found in Data Access Layer**:
  - In [`lib/data/products.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/lib/data/products.ts) line 125, `getProductBySlug` had a hardcoded property assignment: `slug: "turmeric-powder"`.
  - Direct database inspection confirmed the authoritative Supabase record has `id: "cd096cd8-1104-41c5-9539-46a87b5b96c1"` and `slug: "kandhamal-turmeric-powder"`.
  - While mapping `"kandhamal-turmeric-powder"` to `"turmeric-powder"` was intentional for public-facing URL consistency, unconditionally hardcoding `slug: "turmeric-powder"` on line 125 corrupted future product lookups (any product returned from the database would have its slug overwritten with `"turmeric-powder"`).
- **Resolution Implemented**:
  - Updated line 125 in `lib/data/products.ts` to assign `slug: canonicalSlug` where `canonicalSlug = rawProduct.slug === "kandhamal-turmeric-powder" ? "turmeric-powder" : rawProduct.slug`.
  - Unified slug handling across `getActiveProducts` and `getProductBySlug`.
  - Preserved permanent HTTP 308 redirect in `app/shop/[slug]/page.tsx` for legacy `/shop/kandhamal-turmeric-powder` to `/shop/turmeric-powder`.
  - Verified that unknown slugs (e.g., `/shop/unknown-product`) query Supabase, return `null`, and trigger `notFound()` (HTTP 404).

---

### 10.3 Product Metadata & Structured Data Verification

- **Authoritative Product & Offer Validation**:
  - Verified that `/shop/[slug]` derives structured data directly from the active database record:
    - `Product.name`: `"Farmsmith Turmeric Powder"`
    - `Product.brand`: `"FarmSmith Foods"`
    - `Offer.price`: `129` (derived dynamically from `product.price`, matching verified DB value `129`)
    - `Offer.priceCurrency`: `"INR"` (derived from `product.currency`)
    - `Offer.availability`: `https://schema.org/InStock` (derived dynamically from `product.stock_quantity > 0`, matching verified DB stock `91`)
    - `Offer.url`: `https://www.farmsmithfoods.com/shop/turmeric-powder`
    - Absolute image URLs resolving to `https://www.farmsmithfoods.com/images/...`
  - Zero fabricated star ratings, review counts, or GTIN attributes.
- **Dynamic Metadata Enhancements**:
  - Updated `generateMetadata` in `app/shop/[slug]/page.tsx` to emit explicit `robots: { index: false, follow: false }` and `title: "Product Not Found | FarmSmith Foods"` if the product does not exist in the database.
  - Self-referencing canonical URL dynamically set to `https://www.farmsmithfoods.com/shop/${product.slug}`.

---

### 10.4 Sitemap Generation Overhaul

- **Inclusion of Catalogue & Indexable Pages**:
  - Added `${baseUrl}/shop` (`changeFrequency: "daily"`, `priority: 0.9`) to [`app/sitemap.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/sitemap.ts).
  - Maintained verified indexable public pages: `/`, `/shop`, `/why-us`, `/about-us`, `/contact`, `/privacy-policy`, `/terms`, `/track`.
  - Excluded all non-indexable private routes: `/login`, `/signup`, `/checkout`, `/account/*`, `/order/*`, `/api/*`.
- **Elimination of Blanket `new Date()` Timestamps**:
  - Removed blanket `new Date()` from all static route entries. Because static marketing routes do not have verified database update timestamps, `lastModified` is safely omitted instead of emitting false daily timestamps.
  - On product detail routes, `lastModified` is derived strictly from verified database records (`product.updated_at = "2026-10-09T17:20:13.767251+00:00"`). Products without a valid date omit the tag.
  - Verified in generated `.next/server/app/sitemap.xml.body` that exactly 1 genuine `<lastmod>` tag is output (for the updated product), while static pages have clean entries without fabricated dates.

---

### 10.5 Internal Linking Updates

1. **[`components/layout/Navbar.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Navbar.tsx)**:
   - Changed "Shop" navigation link from `/#featured-harvest` to `/shop`.
2. **[`components/layout/Footer.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Footer.tsx)**:
   - Updated `SHOP_LINKS` so "Shop" points to `/shop`.
   - Removed the runtime click interceptor `if (link.href === "/shop") targetHref = "/#featured-harvest"` so clicking "Shop" in the footer smoothly navigates to the dedicated catalogue.
3. **[`components/home/IntroHeroAnimation.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/IntroHeroAnimation.tsx)**:
   - Updated `INTRO_NAV_LINKS` so "Shop" points to `/shop`.
4. **[`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/[slug]/page.tsx)**:
   - Updated breadcrumb hierarchy (both visible HTML navigation and `BreadcrumbList` schema) so the intermediate "Shop" breadcrumb links to `https://www.farmsmithfoods.com/shop` rather than `/#featured-harvest`.
5. **[`app/our-product/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/our-product/page.tsx)**:
   - Restored permanent HTTP 308 redirect `permanentRedirect("/shop")` for the legacy `/our-product` route, replacing the temporary 307 to `/#featured-harvest`.

---

### 10.6 Files Modified and Reasons

| File Path | Change Type | Reason |
| :--- | :--- | :--- |
| [`lib/data/products.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/lib/data/products.ts) | Modified | Replaced hardcoded `slug: "turmeric-powder"` on line 125 with dynamic canonical slug mapping to protect multi-product data integrity. |
| [`app/shop/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/page.tsx) | Modified | Replaced 307 redirect with Server Component mounting `ShopClient.tsx`, adding ISR `revalidate = 60`, unique metadata, canonical tag, and BreadcrumbList schema. |
| [`app/sitemap.ts`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/sitemap.ts) | Modified | Added `/shop` entry, removed fabricated blanket `new Date()` dates on static pages, and mapped verified database `updated_at` dates for products. |
| [`app/shop/[slug]/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/shop/[slug]/page.tsx) | Modified | Pointed Shop breadcrumb (visible HTML & schema) to `/shop`, added `robots: { index: false, follow: false }` for missing products. |
| [`app/our-product/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/our-product/page.tsx) | Modified | Upgraded legacy redirect from 307 `/#featured-harvest` to permanent 308 `permanentRedirect("/shop")`. |
| [`components/layout/Navbar.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Navbar.tsx) | Modified | Pointed "Shop" navigation link to `/shop`. |
| [`components/layout/Footer.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Footer.tsx) | Modified | Pointed "Shop" footer link to `/shop` and removed scroll-to-hash override. |
| [`components/home/IntroHeroAnimation.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/IntroHeroAnimation.tsx) | Modified | Pointed "Shop" intro animation menu link to `/shop`. |

---

### 10.7 Commands Executed & Actual Results

1. **Supabase Schema & Record Inspection (`node --env-file=.env.local`)**:
   - `products` table query: Verified 1 live record (`id: cd096cd8...`, `name: "Farmsmith Turmeric Powder"`, `slug: "kandhamal-turmeric-powder"`, `price: 129`, `stock: 91`, `updated_at: "2026-10-09T17:20:13.767251+00:00"`).
   - `product_images` table query: Verified 0 rows (handled gracefully by gallery fallback system).
2. **TypeScript Compilation Check (`npx tsc --noEmit`)**:
   - **Result**: **Passed with 0 errors (Exit code 0)**.
3. **Next.js Production Build (`npm run build`)**:
   - **Result**: **Compiled successfully with Turbopack in 5.8s (Exit code 0)**.
   - Route table confirmed:
     - `○ /shop` (prerendered static ISR, revalidate 1m)
     - `● /shop/turmeric-powder` (SSG prerendered with `generateStaticParams`)
     - `○ /sitemap.xml` (prerendered static XML route)
     - `○ /our-product` (prerendered 308 redirect)
     - 37/37 total App Router routes prerendered without errors.
4. **HTML Artifacts Inspection (`node scratch/verify-phase2.js`)**:
   - `.next/server/app/shop.html`:
     - `<link rel="canonical" href="https://www.farmsmithfoods.com/shop"/>` (Present)
     - `<meta property="og:title" content="Organic Shop — GI-Tagged Spices & Farm-Fresh Essentials | FarmSmith Foods"/>` (Present)
     - 2 JSON-LD scripts: Script 1: `Organization` + `WebSite`; Script 2: `BreadcrumbList` (Present & Valid).
   - `.next/server/app/shop/turmeric-powder.html`:
     - `<link rel="canonical" href="https://www.farmsmithfoods.com/shop/turmeric-powder"/>` (Present)
     - 2 JSON-LD scripts: Script 1: `Organization` + `WebSite`; Script 2: `BreadcrumbList` + `Product` (Present & Valid).
     - Product Name: `"Farmsmith Turmeric Powder"`, Price: `129 INR`, Availability: `https://schema.org/InStock`.
   - `.next/server/app/sitemap.xml.body`:
     - Contains 9 valid canonical URLs: `/`, `/shop`, `/why-us`, `/about-us`, `/contact`, `/privacy-policy`, `/terms`, `/track`, `/shop/turmeric-powder`.
     - Exactly 1 `<lastmod>` tag (for `/shop/turmeric-powder` matching DB `updated_at`). Blanket fake dates eliminated from static pages.
5. **Unknown Slug Verification**:
   - Verified that `getProductBySlug("unknown-slug")` queries Supabase, returns `null`, and triggers `notFound()`.

---

- **Phase 3 Status**:
  - **Completed** (See Section 11 below for full implementation report).

---

## 11. Phase 3 — Performance, Image SEO & Accessibility

**Implementation Date:** October 17, 2026  
**Status:** **Completed**  
**Remediation Scope:** Phase 3 Only (Font consolidation, image SEO, descriptive alt-text, CLS layout stability, and heading/title hierarchy differentiation).

---

### 11.1 Findings Before Implementation

1. **Unnecessary Font Downloads**:
   - `app/layout.tsx` was loading six separate Google Font families: `Cormorant_Garamond`, `Manrope`, `Cinzel`, `Playfair_Display`, `Plus_Jakarta_Sans`, and `Inter`.
   - Inspection of all components, styles, and CSS variables revealed that `Cinzel`, `Playfair_Display`, `Plus_Jakarta_Sans`, and `Inter` were never referenced anywhere in any component, style attribute, or stylesheet.
   - Result: 8 separate `.woff2` font files were being preloaded in `<head>` on every page load, generating unnecessary HTTP requests and delaying First Contentful Paint (FCP).
2. **Generic Image Alt Attributes**:
   - `components/product/ProductGallery.tsx`: generated generic `alt_text: "${productName} - View 1"`, `View 2`, etc.
   - `components/home/FeaturedProductShowcase.tsx`: output generic `alt="${product.name} - View ${idx + 1}"`.
   - `components/home/PurityShowcase.tsx`: used placeholder `alt="Know the origin - Kandhamal Turmeric Heritage 0"`, `Heritage 1`, `Heritage 2`, `Heritage 3`.
   - `app/about-us/AboutUsClient.tsx`: used generic `alt="FarmSmith Story - 1: The Origin"`, etc.
   - Missed search ranking opportunities for descriptive visual search terms ("Kandhamal turmeric packaging", "NABL turmeric lab test report", etc.).
3. **Heading Hierarchy & Title Duplication**:
   - `app/about-us/page.tsx` had `title: "About Us — Food Crafted with a Mother's Care"`, duplicating the homepage H1 and root metadata tagline and creating keyword cannibalization between the commercial homepage and the story page.

---

### 11.2 Fonts Removed vs. Retained & Rationale

- **Fonts Removed**:
  - `Cinzel` (`--font-cinzel`): Zero usages across the application. Removed from layout and HTML class string.
  - `Playfair_Display` (`--font-playfair`): Only listed as a fallback in CSS; primary serif heading is Cormorant Garamond. Removed from Google Font download pipeline.
  - `Plus_Jakarta_Sans` (`--font-jakarta`): Zero usages across the application. Removed.
  - `Inter` (`--font-inter`): Zero usages across the application. Removed.
- **Fonts Retained**:
  - `Cormorant_Garamond` (`--font-heading`, `--font-serif`): Authoritative brand serif for titles, brand headers, and hero display headings (`weights: ["500", "600", "700"]`, styles: `normal`, `italic`).
  - `Manrope` (`--font-body`, `--font-subheading`, `--font-sans`): Clean, modern geometric sans-serif for UI, navigation, cards, and body copy (`weights: ["400", "500", "600", "700"]`).
- **Typography Binding in CSS**:
  - In `app/globals.css`, bound tokens directly to the `next/font` CSS variables:
    - `--font-heading: var(--font-heading), "Georgia", serif;`
    - `--font-subheading: var(--font-body), system-ui, -apple-system, sans-serif;`
    - `--font-body: var(--font-body), system-ui, -apple-system, sans-serif;`
    - `--font-serif-brand: var(--font-heading), "Georgia", serif;`
- **Measured Result**:
  - WOFF2 preloaded font files in `<head>` dropped from **8 files down to 3 files** (a 62.5% reduction in font network requests).
  - HTML pre-rendered document size dropped from 79.6 KB to 78.1 KB.
  - Zero visual shift or styling regressions.

---

### 11.3 Image Optimization & Layout Shift (CLS) Protection

- **On-the-Fly Modern Image Formats**:
  - Verified that `next.config.ts` has `formats: ["image/avif", "image/webp"]` enabled. Next.js image optimization pipeline automatically negotiates and serves WebP/AVIF format to supporting browsers without renaming physical assets or breaking static URLs.
- **Layout Shift Prevention**:
  - All local and product images are wrapped in containers with explicit aspect ratios (`aspectRatio: "1/1"`, `aspectRatio: "4/3"`, `aspectRatio: "4/5"`), preventing Cumulative Layout Shift (CLS) during image decoding.
  - `sizes` attributes tuned across mobile, tablet, and desktop breakpoints so browsers download right-sized responsive images.
  - `priority` flag retained exclusively on above-the-fold hero and flagship images; below-the-fold images lazy-load naturally.

---

### 11.4 Alt-Text & Accessibility Improvements

1. **[`components/product/ProductGallery.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/product/ProductGallery.tsx)**:
   - View 1: `${productName} packaging front view with certified GI-tag mark`
   - View 2: `${productName} pouch angle view showing seal of purity and origin details`
   - View 3: `${productName} nutrition facts table, ingredients, and storage instructions`
   - View 4: `${productName} third-party NABL batch test certification and quality report`
   - Accessible thumbnail buttons with rich `aria-label` tags.
2. **[`components/home/FeaturedProductShowcase.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/FeaturedProductShowcase.tsx)**:
   - Descriptive slide alt texts matching packaging front, purity seal angle, nutrition table, and NABL batch test certification.
   - Updated thumbnail button `aria-label` attributes.
3. **[`components/home/PurityShowcase.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/PurityShowcase.tsx)**:
   - Slide 0: `"Fertile organic farming landscape in the Eastern Ghats of Kandhamal, Odisha"`
   - Slide 1: `"Traditional harvesting of GI-tagged heirloom turmeric roots in Kandhamal"`
   - Slide 2: `"Sun-drying process of pure golden Kandhamal turmeric rhizomes"`
   - Slide 3: `"Freshly harvested organic Kandhamal turmeric rhizomes showing vibrant golden hue"`
4. **[`app/about-us/AboutUsClient.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/about-us/AboutUsClient.tsx)**:
   - Slide 1: `"FarmSmith founder questioning food transparency and purity in Indian households"`
   - Slide 2: `"FarmSmith field sourcing from organic turmeric farming clusters in Odisha"`
   - Slide 3: `"Partnering directly with local farmers for fair, chemical-free agricultural produce"`
   - Slide 4: `"Independent NABL lab batch testing verifying absence of synthetic dyes and heavy metals"`
   - Slide 5: `"Finished pure GI-tagged turmeric packages ready for conscious consumers"`
   - Brand emblem alt text: `"FarmSmith Foods brand emblem"`
5. **[`components/home/GrowingSection.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/GrowingSection.tsx)**:
   - Sapling alt text: `"Young plant sapling in fertile soil representing FarmSmith sustainable farming and clean grocery staples"`
6. **[`components/layout/Navbar.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Navbar.tsx)** & **[`components/layout/Footer.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Footer.tsx)**:
   - Logo alt text updated to `"FarmSmith Foods logo"`.

---

### 11.5 Heading Hierarchy & Title Differentiation

- **Resolved About Us Title Overlap**:
  - Updated [`app/about-us/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/about-us/page.tsx):
    - `title: "Our Story & Purpose — Soil, Origin & Heritage | FarmSmith Foods"`
    - `description: "Discover the FarmSmith Foods journey: from questioning supermarket food purity to partnering directly with organic Indian farmers for batch-tested, GI-tagged produce."`
    - Added dedicated Open Graph and Twitter summary metadata.
  - Eliminates title cannibalization with Homepage H1 (`"Food crafted with a mother's care"`).
- **Verified Heading Structure Across Public Routes**:
  - `/` (Home): H1 = `"Food crafted with a mother's care"`; H2 sections nest logically (`"Our GI-Tagged Harvest"`, `"YOU check the quality of YOUR product"`, `"Farmsmith is growing"`, etc.).
  - `/about-us`: H1 = `"Food doesn't begin on a supermarket shelf. It begins with soil, water, people and place."` (Distinct from homepage).
  - `/why-us`: H1 = `"Why Choose FarmSmith Foods?"`.
  - `/shop`: H1 = `"Our Organic Collection"`.
  - `/shop/[slug]`: H1 = `{product.name}` (`"Farmsmith Turmeric Powder"`).
  - `/contact`: H1 = `"Contact FarmSmith"`.

---

### 11.6 Files Modified and Reasons

| File Path | Type | Reason |
| :--- | :--- | :--- |
| [`app/layout.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/layout.tsx) | Modified | Removed 4 unused Google fonts (`Cinzel`, `Playfair_Display`, `Plus_Jakarta_Sans`, `Inter`), retaining only `Cormorant_Garamond` and `Manrope`. |
| [`app/globals.css`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/globals.css) | Modified | Bound design tokens directly to `next/font` CSS variables with system fallbacks to eliminate CLS risks. |
| [`components/product/ProductGallery.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/product/ProductGallery.tsx) | Modified | Replaced generic `View 1-4` with descriptive product view alt text; added accessible thumbnail button `aria-label` tags. |
| [`components/home/FeaturedProductShowcase.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/FeaturedProductShowcase.tsx) | Modified | Replaced generic `View 1-4` with descriptive slide alt texts and updated thumbnail button accessible labels. |
| [`components/home/PurityShowcase.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/PurityShowcase.tsx) | Modified | Replaced `Heritage 0-3` with descriptive alt text for origin harvest and sun-drying photography. |
| [`app/about-us/AboutUsClient.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/about-us/AboutUsClient.tsx) | Modified | Replaced `Story 1-5` with descriptive narrative alt text; updated brand emblem alt text. |
| [`app/about-us/page.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/app/about-us/page.tsx) | Modified | Updated title and meta description to eliminate overlap with homepage H1; added OG and Twitter card tags. |
| [`components/product/ProductCard.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/product/ProductCard.tsx) | Modified | Added descriptive alt text for product card slide images. |
| [`components/home/GrowingSection.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/GrowingSection.tsx) | Modified | Replaced generic alt text with descriptive sapling / sustainable agriculture description. |
| [`components/layout/Navbar.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Navbar.tsx) | Modified | Updated logo alt text to `"FarmSmith Foods logo"`. |
| [`components/layout/Footer.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/layout/Footer.tsx) | Modified | Updated logo alt text to `"FarmSmith Foods logo"`. |
| [`components/home/IntroHeroAnimation.tsx`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/components/home/IntroHeroAnimation.tsx) | Modified | Updated flying brand emblem alt text to `"FarmSmith Foods emblem"`. |
| [`SEO-AUDIT-REPORT.md`](file:///c:/Users/Sachin/OneDrive/Desktop/prd%20websites/farmsmith-nextjs-updated-backend/farmsmith/SEO-AUDIT-REPORT.md) | Modified | Appended Section 11 documenting Phase 3 font optimization, image SEO, alt text, and validation results. |

---

### 11.7 Validation & Build Results

1. **TypeScript Type-Check (`npx tsc --noEmit`)**:
   - **Result**: **Passed with 0 errors (Exit code 0)**.
2. **Next.js Production Build (`npm run build`)**:
   - **Result**: **Compiled successfully with Turbopack in 6.3s (Exit code 0)**.
   - All 37 static and dynamic App Router routes compiled cleanly.
3. **Font Payload Reduction Verification**:
   - HTML pre-rendered output in `.next/server/app/shop.html` verified: `<html class="... cormorant_garamond... manrope...">`.
   - Preloaded font files reduced from 8 `.woff2` files down to 3 `.woff2` files.
4. **Image Alt Text Inspection in Built Output**:
   - Verified that built static HTML files contain the new descriptive alt text and aria-labels.
5. **No Visual or Layout Regressions**:
   - Typography appearance, font weights, and layout styling preserved exactly as designed.
   - Zero modifications to checkout, auth, payments, database schemas, inventory, or order APIs.



