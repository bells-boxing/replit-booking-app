# Overview

This is a full-stack fitness gym management application called "Bells Gym" built with React (TypeScript) frontend and Express.js backend. The application provides a comprehensive platform for managing gym classes, personal training sessions, memberships, and payments. It features role-based access control with student, trainer, and admin roles, and includes a complete booking and payment system with Stripe integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with **React 18** and **TypeScript**, using **Vite** as the build tool. The application follows a component-based architecture with:

- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables for consistent branding
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

The frontend implements a role-based navigation system that conditionally renders different pages based on user authentication and role permissions.

## Backend Architecture
The backend uses **Express.js** with TypeScript and follows a RESTful API design pattern:

- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL session store
- **API Structure**: Modular route handlers with centralized error handling
- **Middleware**: Custom logging middleware for API request/response tracking

## Database Design
The application uses **PostgreSQL** with a comprehensive schema that includes:

- **User Management**: Users table with role-based access control (student, trainer, admin)
- **Class System**: Classes, schedules, and bookings with status tracking
- **Personal Training**: One-on-one session management
- **Payment Processing**: Payment records with status tracking and Stripe integration
- **Session Storage**: PostgreSQL-backed session storage for authentication

Key design decisions include using enums for consistent status values and implementing proper foreign key relationships between entities.

## Authentication & Authorization
The system implements **Replit Auth** as the primary authentication mechanism:

- **OIDC Integration**: Uses OpenID Connect for secure authentication
- **Session-Based Auth**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Three-tier permission system (student, trainer, admin)
- **Route Protection**: Server-side middleware and client-side guards

This approach was chosen for seamless integration with the Replit platform while maintaining security and scalability.

# External Dependencies

## Payment Processing
**Stripe** integration for handling all payment operations:
- Payment intent creation and confirmation
- Subscription management for memberships
- Customer management and billing

## Database & Hosting
- **Neon Database**: PostgreSQL database hosting with serverless architecture
- **Replit Platform**: Development and deployment environment with built-in authentication

## UI & Styling
- **Shadcn/ui**: Pre-built accessible components based on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless UI primitives for complex components

## Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the entire application stack

The architecture emphasizes type safety, developer experience, and maintainability while providing a scalable foundation for a gym management system.