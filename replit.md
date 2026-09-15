# Orbit to Orbit Express - Space Cargo Logistics Platform

## Overview
Orbit to Orbit Express is a comprehensive space cargo logistics platform for aerospace engineers and space industry professionals. It provides cost calculations, mission planning, and rocket compatibility analysis for cargo deployments to various orbits (LEO, GEO, Moon, Mars, and beyond). The platform aims to be a professional B2B tool for the space industry, offering detailed insights and streamlined workflows for space mission planning.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application features a full-stack monorepo architecture:
- **Frontend**: React with TypeScript, Vite, Shadcn/UI (with Radix UI primitives), Tailwind CSS, Wouter for routing, and TanStack Query for state management.
- **Backend**: Express.js with TypeScript, providing a RESTful API for calculations.
- **Database**: PostgreSQL with Drizzle ORM, with an initial in-memory data layer for flexibility.
- **Shared**: A `shared/` directory for common types and schemas ensures type safety across the stack.

**Key Design Decisions:**
- **UI/UX**: Swiss Rail Design (SBB/ÖBB inspired) featuring white backgrounds, a primary red accent (`#e3000f`), and a professional grayscale text hierarchy. The design emphasizes sharp, professional aesthetics with Inter typography (JetBrains Mono for technical data) and no rounded corners. It supports dark/light themes and is mobile-first responsive.
- **Data Flow**: A calculation pipeline processes user inputs (payload, orbit, launch region) to determine delta-v, cost estimates, and compatible rockets, offering mission metrics and optimization insights.
- **Mission Planning Workflow**: Integrates basic logistics with advanced modules for launch windows, regulatory compliance, environmental impact, insurance estimation, and project timeline generation.
- **Monorepo Structure**: Separated into `client/`, `server/`, and `shared/` for clear separation of concerns and maintainability.
- **Programmatic SEO**: Generates dedicated pages for rockets, orbits, and rocket comparisons to enhance search engine visibility.
- **Lead Capture**: Implements reusable lead capture forms to gather user information.
- **Analytics**: Tracks page views for daily visitor reporting.
- **Regulatory Compliance**: Includes features for GDPR/CCPA compliance, cookie consent, privacy policies, and terms of service.
- **Content Management**: Utilizes a JSON-based CMS for managing article content.

## External Dependencies
- **Database Hosting**: Neon Database (PostgreSQL)
- **ORM**: Drizzle ORM
- **UI Components**: Shadcn/UI, Radix UI
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **External Data APIs**:
    - Launch Provider Data (e.g., SpaceX, ULA, ISRO, Roscosmos) for rocket specifications.
    - Orbital Mechanics calculations for delta-v.
    - Launch Library 2 API for space launch calendar data.
    - SpaceNews RSS feed for industry news.
    - Finnhub for stock data.
- **Analytics**: Plausible Analytics
- **Email/Notifications**: Resend (for lead capture and daily visitor analytics emails)