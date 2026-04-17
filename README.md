# 0xMarket

0xMarket is a full-stack digital marketplace focused on developer-centric assets and a terminal-inspired interface.

## Project Summary

The platform combines a React frontend with an Express API and MongoDB data layer. It is structured as a monorepo with isolated client and server applications, designed for iterative feature delivery.

## Core Features

- Marketplace asset catalog served from a persistent database
- REST API for health status, asset retrieval, and AI route integration
- Zustand-based client state management for data and UI actions
- Seed pipeline for generating demo inventory quickly
- Terminal-style interface direction for the frontend experience

## Current Capabilities

- Asset listing from MongoDB
- API health endpoint
- Gemini endpoint that returns an in-character Black Market Dealer reply
- Client-side data loading, error handling, and request state feedback

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Zustand
- Backend: Node.js, Express, Mongoose
- Database: MongoDB

## Repository Structure

```text
.
├── client/
│   ├── src/
│   └── public/
└── server/
    ├── config/
    ├── models/
    ├── routes/
    └── scripts/
```

## API Surface

- `GET /api/health`
- `GET /api/assets`
- `POST /api/gemini` (Gemini-powered Black Market Dealer reply)

## Product Status

This project is currently under active development.

Work in progress areas include:

- Production-grade Gemini integration with persona prompt handling
- Authentication and account-level ownership
- Cart/checkout flow hardening
- Admin workflows for asset publishing and moderation
- Test coverage expansion across client and server

## Roadmap (In Progress)

- Stabilize data contracts between frontend store and backend routes
- Add role-based access controls for management operations
- Introduce deployment-grade observability and error monitoring
- Improve UX polish for onboarding and asset discovery

## Repository

- Owner: afnan0304
- Name: 0xMarket
- Primary branch: main
