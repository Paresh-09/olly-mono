# Landing App

This is the landing pages application for Olly Social, containing all public-facing marketing pages, tools, blog, and case studies.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001).

## Structure

- `app/(marketing)/` - Marketing and homepage content
- `app/(tools)/` - All free tools and utilities
- `app/(mobile)/` - Mobile app landing pages
- `app/blog/` - Blog system
- `app/case-study/` - Case studies
- `app/guides/` - User guides
- `app/api/` - API routes for tools and public features
- `data/` - Data files for tools, products, and content
- `components/` - Shared UI components
- `lib/` - Utility functions and helpers

## Development

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run check-types` - Type check with TypeScript
