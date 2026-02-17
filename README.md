# OmniaVital — Premium Performance Wellness

A luxury, bio-optimized supplement brand built with React, Tailwind CSS, and Lovable Cloud.

## Features

- 🧬 Premium dark-luxe design with Performance Teal + Gold accent palette
- 🎙️ ElevenLabs conversational voice agent for visitor conversion
- 📦 Database-backed product catalog with 3 ritual products
- 📧 Email capture for "The Collective" community
- ✨ Framer Motion scroll-reveal animations throughout
- 📱 Fully responsive, mobile-first design

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **UI**: shadcn/ui, Framer Motion, Lucide Icons
- **Backend**: Lovable Cloud (database, auth, edge functions)
- **Voice AI**: ElevenLabs Conversational AI (WebRTC)

## ElevenLabs Voice Agent

The site includes a floating voice agent widget powered by ElevenLabs Conversational AI. It connects to a public agent via WebRTC for real-time voice conversations.

### Agent ID

```
agent_5501kgzectw4ep69wjamch6xr2k7
```

### Client Tool Configuration

The following JSON template can be attached as a client tool for the ElevenLabs agent to trigger client-side actions:

```json
{
  "type": "client",
  "name": "navigate_to_product",
  "description": "Navigate the user to a specific product page when they express interest in a ritual product",
  "expects_response": false,
  "response_timeout_secs": 1,
  "parameters": [
    {
      "name": "product_slug",
      "type": "string",
      "description": "The product slug to navigate to (morning-routine, focus-window, evening-recovery)"
    }
  ],
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  },
  "assignments": [],
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "tool_call_sound": null,
  "tool_call_sound_behavior": "auto",
  "execution_mode": "immediate"
}
```

### Adding Client Tools to the Agent

1. Open the ElevenLabs dashboard and select the agent
2. Navigate to **Tools** → **Add Tool** → **Client**
3. Paste the JSON configuration above
4. In your React code, handle the tool call via the `clientTools` option in `useConversation`:

```tsx
const conversation = useConversation({
  clientTools: {
    navigate_to_product: (params: { product_slug: string }) => {
      window.location.href = `/product/${params.product_slug}`;
      return "Navigated to product";
    },
  },
});
```

## Development

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Deployment

Open [Lovable](https://lovable.dev) and click **Share → Publish**.
