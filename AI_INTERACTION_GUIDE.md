# AuraChat AI Interaction Guide

## Overview

AuraChat supports two kinds of participation in a room:

- normal discussion between people in the room
- optional AI replies when someone explicitly uses **Ask AI**

This matters because the AI does not auto-reply to every message anymore. People can talk naturally, and the AI only joins when requested.

---

## The AI Hint Banner

At the top of the room, users see a hint banner that explains the interaction model:

1. **Chat with Everyone** - regular room discussion
2. **Ask the AI** - request a reply from Aura AI
3. **@mention Users** - direct a message to someone specific
4. **React to Messages** - add emoji reactions

The current banner language in the app is:

- **How to use the discussion and AI**
- **Regular discussion first, AI replies on request**

---

## How Conversation Works

### 1. Regular Discussion

Use this for normal conversation with other people in the room.

Example:

```text
User: "I think we should focus on user experience first."
-> Visible to everyone
-> Stored in room history
-> Does not trigger an AI reply
```

How to use it:

- Type a normal message
- Click **Send**
- Your message appears in the room for everyone

### 2. Ask AI

Use this when you want the AI assistant to answer in the room.

Example:

```text
User: "What is the best approach for user authentication?"
-> Visible to everyone
-> Tagged as Ask AI
-> Aura AI replies in the room
-> The AI reply is clearly labeled
```

How to use it:

1. Type your question.
2. Click **Ask AI**.
3. Confirm the toggle shows **On**.
4. Click **Send to AI**.
5. Wait for the shared room response from **Aura AI**.

What users see:

- your message shows an **AI Asking AI** badge
- the assistant response shows an **AI Reply** badge
- the assistant response also shows **AI-generated response**

### 3. Mention Users

Use mentions when you want to direct a message to a specific person.

Example:

```text
User: "@Sarah what do you think about this approach?"
-> Sarah's name is highlighted
-> Sarah can notice the message more easily
```

How to use it:

1. Type `@`.
2. Start typing the person's name.
3. Choose from the autocomplete list.
4. Send the message normally.

---

## Current UI Labels

The guide should match the app exactly. These are the current labels in the product:

- Input placeholder: `Message the room. Use @ to mention someone, or click Ask AI for an AI reply.`
- Ask AI toggle: `Ask AI`
- Ask AI active state: `On`
- Normal send button: `Send`
- Ask AI send button: `Send to AI`
- AI hint header: `How to use the discussion and AI`
- AI hint subtext: `Regular discussion first, AI replies on request`
- User badge for AI request: `AI Asking AI`
- Assistant badge: `AI Reply`
- Assistant disclosure label: `AI-generated response`
- Assistant display name: `Aura AI`

---

## Best Practices

### Use regular discussion when:

- you are chatting with other people
- you are reacting to an idea
- you are giving your own opinion
- you are continuing a human conversation

### Use Ask AI when:

- you want an answer from the assistant
- you want analysis, explanation, or suggestions
- you want technical help
- you want a structured AI response in the room

### Good Ask AI prompts

Less effective:

```text
"What about this?"
```

Better:

```text
"Should we use OAuth for authentication in our API?"
```

Less effective:

```text
"How do we scale?"
```

Better:

```text
"Our app currently has 10,000 users. What strategies would you recommend for scaling to 1 million users?"
```

---

## Example Room Flow

```text
Alice: "I'm wondering about the best database for our project."
-> Regular discussion message

Bob: "@Alice I'd suggest PostgreSQL for reliability."
-> Mentioned reply to Alice

Charlie: [Ask AI enabled] "What are the pros and cons of PostgreSQL vs MongoDB?"
-> AI request sent to the room

Aura AI: "This is an AI-generated response. PostgreSQL is stronger for..."
-> Clearly labeled AI reply

Dave: "That helps. Let's compare our actual data model next."
-> Human discussion continues
```

---

## Message Tags And Storage

When a user clicks **Ask AI**, the message is sent with:

```text
isAskingAI: true
```

That flag is used to:

- show the request badge on the user message
- decide whether the server should trigger an AI response
- keep normal messages as normal discussion

Messages may include:

- username
- timestamp
- content
- color
- role
- reactions
- `isAskingAI`
- `isAiGenerated`

---

## Mobile Notes

The current UI is mobile-friendly:

- controls wrap cleanly on smaller screens
- mention suggestions stay usable on touch devices
- the banner can be expanded or collapsed
- button labels are text-based and clearer than icon-only controls

---

## FAQ

**Does the AI answer every message?**  
No. The AI only replies when someone explicitly uses **Ask AI**.

**Can everyone in the room see the AI request?**  
Yes. The original user message stays visible in the room.

**Can everyone see that the assistant reply came from AI?**  
Yes. AI messages are labeled with **Aura AI**, **AI Reply**, and **AI-generated response**.

**Can I still chat without using AI?**  
Yes. That is now the default behavior.

**Can I tag someone and ask the AI in the same message?**  
Yes. The room will still see it as an AI request if **Ask AI** is enabled when you send it.

---

## Quick Reference

| Action | What to click | Result |
| --- | --- | --- |
| Regular discussion | `Send` | Sends a normal room message |
| Ask AI | `Ask AI` then `Send to AI` | Sends a room message and triggers Aura AI |
| Mention someone | Type `@name` | Highlights the mentioned user |
| React to a message | Choose an emoji reaction | Adds a synced reaction |

---

**Last Updated**: April 21, 2026  
**Status**: Guide aligned with the current AuraChat UI and AI behavior
