# AuraChat

Shared-room AI chat with real-time multiplayer streaming, reactions, personas, summaries, exports, and room memory.

## Features

- Real-time multiplayer AI chat rooms with shareable URLs
- Full room history replay for users who join mid-session
- OpenAI streaming responses broadcast live to every user in the room
- Redis-backed room memory with 24-hour TTL and last-40-message context
- Live presence sidebar with animated join and leave states
- Shared room-wide AI persona selector
- Shared room-wide model selector
- Markdown rendering with syntax-highlighted code blocks
- Runnable JavaScript code blocks inside sandboxed iframes
- Message reactions synced to all users
- `@mention` autocomplete with highlighted mentions and pulsing presence dots
- Streaming room summaries in a modal
- Chat export to Markdown or print-to-PDF
- Lobby with random room generation and animated mesh background
- GitHub bootstrap script for initializing and pushing the repo

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 App Router |
| Styling | Tailwind CSS |
| Realtime Client | socket.io-client |
| Markdown | react-markdown |
| Code Highlighting | react-syntax-highlighter |
| Motion | Framer Motion |
| Fonts | Syne, DM Sans, JetBrains Mono |
| Backend | Node.js + Express |
| Realtime Server | Socket.io |
| AI | OpenAI Node SDK |
| Persistence | Redis via ioredis |
| Deployment | Vercel + Render + Upstash Redis |

## Folder Structure

```text
aurachat/
├── client/
│   ├── app/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── globals.css
│   │   └── room/
│   │       └── [roomId]/
│   │           └── page.jsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.js
│   │   ├── socket.js
│   │   ├── openai.js
│   │   ├── rooms.js
│   │   └── redis.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── setup.sh
└── README.md
```

## Local Setup

### Client

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

### Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Open the app at `http://localhost:3001`.

## Environment Variables

### Client

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SOCKET_URL` | Socket server URL | `http://localhost:4000` |

### Server

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Express + Socket.io port | `4000` |
| `OPENAI_API_KEY` | OpenAI API key | `your_openai_api_key_here` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `CLIENT_ORIGIN` | Allowed frontend origin | `http://localhost:3001` |

## Socket.io Events

### Client Emits

| Event | Payload |
| --- | --- |
| `join-room` | `{ roomId, username, color }` |
| `leave-room` | `{ roomId }` |
| `send-message` | `{ roomId, message, model, persona, username }` |
| `add-reaction` | `{ roomId, messageId, emoji, username }` |
| `remove-reaction` | `{ roomId, messageId, emoji, username }` |
| `typing-start` | `{ roomId, username }` |
| `typing-stop` | `{ roomId, username }` |
| `change-persona` | `{ roomId, persona }` |
| `change-model` | `{ roomId, model }` |

### Server Emits

| Event | Payload |
| --- | --- |
| `room-joined` | `{ users, history, currentPersona, currentModel }` |
| `user-joined` | `{ username, color }` |
| `user-left` | `{ username }` |
| `new-message` | `{ id, username, color, content, timestamp, role }` |
| `ai-stream-start` | `{}` |
| `ai-stream-token` | `{ token }` |
| `ai-stream-end` | `{ fullContent, messageId }` |
| `reaction-updated` | `{ messageId, reactions }` |
| `user-typing` | `{ username }` |
| `user-stop-typing` | `{ username }` |
| `persona-changed` | `{ persona, changedBy }` |
| `model-changed` | `{ model, changedBy }` |

## Deployment Guide

### Vercel for the Client

1. Import the `client` folder into Vercel as a Next.js project.
2. Set `NEXT_PUBLIC_SOCKET_URL` to your deployed backend URL.
3. Deploy.

### Render for the Server

1. Create a new Web Service from the `server` folder.
2. Set the start command to `npm start`.
3. Add environment variables: `PORT`, `OPENAI_API_KEY`, `REDIS_URL`, `CLIENT_ORIGIN`.
4. Deploy and copy the public backend URL.

### Upstash for Redis

1. Create a Redis database in Upstash.
2. Copy the `REDIS_URL`.
3. Add it to the Render service as `REDIS_URL`.

## GitHub Auto Push

Run the setup script from the repo root:

```bash
chmod +x setup.sh
./setup.sh
```

The script initializes git, creates the initial commit, creates a public GitHub repository named `aurachat`, pushes the code, and prints the repo URL and local next steps.

## Windows Local Start

If you are running AuraChat on Windows PowerShell, you can start both apps and open the browser with:

```powershell
.\start-local.ps1
```

## Author

Built by Codex for AuraChat.
