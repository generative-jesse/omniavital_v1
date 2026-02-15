

# OmniaVital — Premium Performance Wellness

A luxury, Apple-meets-Lululemon e-commerce frontend for a bio-optimized supplement brand, backed by Lovable Cloud (Supabase) for products and email capture.

---

## 1. Brand Foundation & Design System

- **Color palette**: Deep Black (#0A0A0A), Soft White (#F5F5F7), Performance Teal accent (~#2DD4BF or similar)
- **Typography**: Inter font family with high-contrast sizing — oversized headlines, refined body text
- **Spacing**: Generous whitespace throughout, cinematic proportions
- **Install Framer Motion** for scroll-reveal animations and smooth transitions

---

## 2. Navigation

- Minimalist sticky top nav: **Shop · Science · Community · Account**
- Transparent on hero, transitions to solid on scroll
- Mobile: clean hamburger menu with full-screen overlay

---

## 3. Hero Section

- Full-viewport hero with a high-res lifestyle background image (gradient overlay for text legibility)
- Bold headline: *"Optimal Life, Seamlessly Integrated."*
- Sub-headline: *"Bio-optimized nutrition for the modern vanguard."*
- Primary CTA button: "Explore The Ritual"
- Subtle scroll-down indicator animation

---

## 4. The Ritual — Bento Grid

- A visually striking asymmetric grid with three cards:
  - **The Morning Routine** — Organic Protein + Multi
  - **The Focus Window** — Brain/Nootropics
  - **The Evening Recovery** — Night-time Magnesium
- Each card features a product image, ritual name, brief tagline, and a "Discover" link
- Cards animate in on scroll with staggered fade-up effects
- Hover states with subtle scale and shadow transitions

---

## 5. Community CTA / Email Capture

- Mid-page banner or sticky section: *"Join the Collective. Get 20% off your first yearly subscription."*
- Premium-feeling email input — styled like a membership application (large, minimal, with a single "Apply" button)
- Email submissions stored in Supabase `email_signups` table
- Success state with an elegant confirmation message

---

## 6. Product Detail Page (PDP)

- Clean product page template pulling data from Supabase `products` table
- Large, matte-finish product image area
- Product name, price, and a short description
- Tabbed info section: **Bio-Availability · Sourcing · Daily Ritual**
- "Add to Ritual" CTA button (visual only for now, no cart backend)
- Scroll-reveal animations on content sections

---

## 7. Database Setup (Lovable Cloud)

- **`products` table**: id, name, slug, category (morning/focus/evening), tagline, description, price, image_url, bio_availability_text, sourcing_text, daily_ritual_text
- **`email_signups` table**: id, email, created_at
- Seed with 3 products (one per ritual category)
- RLS policies for public read on products, public insert on email_signups

---

## 8. Mobile-First Polish

- All layouts designed mobile-first, scaling up to desktop
- Touch-friendly tap targets, smooth transitions
- Community email capture feels like a native app flow on mobile

