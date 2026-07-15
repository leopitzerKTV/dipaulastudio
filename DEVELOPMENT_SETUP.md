# Development Setup Guide

## Prerequisites

- **Node.js**: 18.x, 20.x, or 22.x (tested versions)
- **npm**: Latest version
- **Bun** (optional): Package manager alternative to npm

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will:
- Install 539 packages
- Create `node_modules/` directory
- Generate `package-lock.json` (or `bun.lock` if using Bun)

**Warnings during install** (can be safely ignored):
- `tsconfck@3.1.6`: Unmaintained package (used by TypeScript tools)
- `recharts@2.15.4`: Consider upgrading to v3 in future

### 2. Code Formatting

Run Prettier to format code according to project standards:

```bash
npm run format
```

This will:
- Format all TypeScript/TSX files
- Adjust line lengths, spacing, imports
- Ensure consistent code style across the project

## Development Commands

```bash
# Start dev server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Linting & Code Quality

### Current Lint Status

**Expected errors** (to be fixed in Phase 2.2):
- 10 errors: Empty block statements in `src/routes/editor.tsx` (catch blocks without handling)
- These are deliberate and tracked for error-handling refactor

**Warnings** (mostly non-critical):
- 14 warnings: Fast refresh violations, missing useEffect dependencies
- These follow React best practices and will be addressed in refactoring phases

### Running Lint

```bash
# Run linter
npm run lint

# Auto-fix fixable issues
npm run lint -- --fix
```

### Understanding Lint Output

- **Errors**: Must be fixed before deployment
- **Warnings**: Should be addressed but don't block builds

Current lint output shows:
- ✅ Code formatting: PASS
- ✅ Type safety: PASS
- ⚠️ Error handling: TODO (Phase 2.2)
- ⚠️ React best practices: TODO (Phase 2.2)

## Project Structure

```
src/
├── routes/           # File-based routing (TanStack Router)
├── components/       # Reusable React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── integrations/    # External service integrations (Supabase)
└── assets/          # Static images and files

.github/
└── workflows/       # CI/CD pipelines (GitHub Actions)
```

## Environment Variables

See `.env.example` for required environment variables.

For development, create `.env.local` with your Supabase credentials:

```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

**Note**: Never commit `.env` or `.env.local` - they are in `.gitignore`

## Continuous Integration

The project uses GitHub Actions for automated:
- ✅ Dependency installation
- ✅ Code linting
- ✅ Building
- ✅ Testing (when implemented)

See `.github/workflows/README.md` for details.

## Common Issues

### "Cannot find package '@eslint/js'"
```bash
# Solution: Reinstall dependencies
npm install
```

### Port 8080 already in use
```bash
# Dev server will try next available port, or:
PORT=3000 npm run dev
```

### Build fails with cache issues
```bash
# Clear Vite cache
rm -rf .output node_modules/.vite
npm run build
```

## Next Steps

- See `SECURITY_NOTICE.md` for security considerations
- See the root plan at `./plans/preciso-que-voc-analise-refactored-cascade.md` for development roadmap
- Check `CLAUDE.md` for architectural details

---

**Last updated**: 2026-07-15  
**Maintained by**: Development Team
