# OmniaVital

Premium performance wellness. A direct-to-consumer supplement brand built around three daily rituals — Morning, Focus and Evening — with a full member portal for tracking adherence, purchases and community.

## Features

- Product catalog with detailed, database-backed product pages
- Member accounts with email/password authentication
- Member portal: profile with a public OV tag, purchase history, ritual calendar with streaks and achievement rings, community forum and an AI wellness coach
- Conversational voice agent for visitor questions
- Email capture for The Collective
- Fully responsive, mobile-first dark-luxe interface

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **UI:** shadcn/ui, Framer Motion, Lucide icons
- **Backend:** Postgres database, authentication, edge functions
- **Voice AI:** ElevenLabs Conversational AI (WebRTC)

## Local development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:8080`.

## Project structure

```
src/
  assets/        brand and product imagery
  components/    marketing sections, navigation, shared UI
  components/dashboard/  member portal tabs
  hooks/         auth and utility hooks
  pages/         routed screens
  integrations/  backend client and generated types
supabase/
  functions/     edge functions (wellness coach)
```

## License

© 2026 OmniaVital. All rights reserved.
