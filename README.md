# Next-Alchemy 15 🧪⚡

A comprehensive, production-ready Next.js 15 boilerplate with TypeScript, custom Tailwind CSS plugins, Shadcn UI, and modern development tools. This boilerplate follows clean architecture principles and provides a solid foundation for scalable applications.

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🚀 Core Framework
- **Next.js 15.3.3** with App Router
- **React 19** with Server Components
- **TypeScript 5.8.3** for type safety
- **Next Form** component for enhanced forms

### 🎨 Styling & UI
- **Tailwind CSS 3.4** with custom plugins
- **Shadcn UI 2.1.2** components
- **Custom Tailwind plugins** for visual effects:
  - 🌟 Neon glow effects
  - ✨ Inner glow effects
  - 🌈 Text gradients
  - 📝 Text stroke effects
  - ❄️ Frosted glass effects (WIP)
- **Next-themes** for dark/light mode
- **Lucide React** icons + custom icon support

### 🛠 Development Tools
- **ESLint 8.57** with custom rules
- **Prettier 3.3** with Tailwind plugin
- **Husky 8.0** for git hooks
- **Lint-staged 15.2** for pre-commit checks
- **Commitlint 16.2** for conventional commits

### 🧪 Testing
- **Jest 29.7** testing framework
- **React Testing Library 16.0**
- **@testing-library/jest-dom** for custom matchers

### 📊 Monitoring & Analytics
- **Sentry** for error monitoring
- **Vercel Analytics** for performance insights
- **Vercel Speed Insights** for Core Web Vitals

### 🏗 Architecture
- Clean architecture patterns
- Error boundaries for fault tolerance
- Custom hooks and utilities
- Comprehensive TypeScript configuration
- Modular component structure

## 🚀 Quick Start

### Prerequisites

- Node.js 18.18.0 or higher
- npm 9.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/next-alchemy-15.git
   cd next-alchemy-15
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update the environment variables as needed.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:turbo` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run type-check` | Check TypeScript types |
| `npm run clean` | Clean build artifacts |

## 📁 Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── not-found.tsx      # 404 page
│   └── global-error.tsx   # Global error boundary
├── components/             # Reusable components
│   ├── ui/                # Shadcn UI components
│   ├── global/            # Global components (Header, Footer, etc.)
│   ├── providers/         # Context providers
│   └── error/             # Error handling components
├── hooks/                 # Custom React hooks
├── lib/                   # Library configurations
│   ├── jest/              # Jest configuration
│   └── sentry/            # Sentry configuration
├── models/                # Data models and schemas
├── server/                # Server-side utilities
└── util/                  # Utility functions
```

## 🎨 Styling & Theming

### Advanced Theming System
The project uses a sophisticated theming system with:
* **120+ custom colors** including metals, gemstones, and social media colors
* **Automatic shade generation** using Chroma.js
* **Dark/light mode** with system preference detection
* **Custom CSS variables** for Shadcn/UI integration

#### Color Palette Examples

```typescript
// Custom color families
dark: generateShades('#1A102B')
light: generateShades('#dae9dc')
accent1: generateShades('#319bcf')
accent2: generateShades('#0ed729')

// Metals
copper: generateShades('#b87333')
silver: generateShades('#ecebff')
gold: generateShades('#ffd83e')

// Gemstones
emerald: generateShades('#50c878')
ruby: generateShades('#e0115f')
sapphire: generateShades('#0f52ba')

// Social Media
x: { primary: '#1DA1F2', dark: '#14171A', light: '#AAB8C2' }
facebook: { primary: '#1877F2', dark: '#3b5998', light: '#8b9dc3' }
instagram: { primary: '#E4405F', gradientStart: '#F58529', gradientEnd: '#DD2A7B' }
```

### Custom Tailwind Plugins

This boilerplate includes several custom Tailwind CSS plugins for stunning visual effects:

#### Neon Glow Effects
```html
<div class="neon-accent1">Neon glow effect</div>
<button class="neon-accent2 hover:scale-105">Glowing button</button>
```

#### Inner Glow Effects
```html
<div class="inner-glow-accent1-45">Subtle inner glow</div>
<div class="inner-glow-accent4-65">Stronger inner glow</div>
```

#### Text Gradients
```html
<h1 class="text-gradient-lime-violet">Gradient text</h1>
<h2 class="text-gradient-red-yellow">Another gradient</h2>
```

#### Text Stroke Effects
```html
<h1 class="text-stroke-2 text-stroke-accent1-400">Outlined text</h1>
```

#### Frosted Glass Effects
```html
<div class="frosted-glass">Glassmorphism effect</div>
<div class="frosted-glass-dark">Dark mode glass</div>
```

## 🌈 Color System

The project includes an extensive color system with automatically generated shades:

- **Primary Colors**: `dark`, `light`, `accent1-4`
- **Social Media Colors**: `x`, `facebook`, `instagram`, `linkedin`, etc.
- **Material Colors**: `copper`, `bronze`, `silver`, `gold`, `platinum`
- **Gemstone Colors**: `diamond`, `ruby`, `emerald`, `sapphire`
- **Nature Colors**: `forest`, `fire`, `sun`, `coffee`, `sand`

Each color automatically generates 9 shades (100-900) using chroma-js.

## 🔧 Configuration

### TypeScript
The project uses strict TypeScript configuration with custom path mapping:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/hooks/*` → `./src/hooks/*`

### ESLint
Custom ESLint configuration includes:
- Next.js recommended rules
- TypeScript strict rules
- Import/export optimization
- React best practices
- Custom component patterns

### Prettier
Configured with:
- Tailwind CSS class sorting
- 99 character line width
- Single quotes for consistency
- ES5 trailing commas

## 🧪 Testing

The project includes a comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files should be placed in:
- `__tests__/` directory
- `.test.ts|tsx` files
- `.spec.ts|tsx` files

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run deploy        # Deploy to preview
npm run deploy:prod   # Deploy to production
```

### Manual Build
```bash
npm run build
npm start
```

## 🔒 Environment Variables

Create a `.env.local` file with the following variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCTION_URL=https://your-domain.com
NEXT_PUBLIC_DEVELOPMENT_URL=http://localhost:3000

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# Other services
# Add your API keys and configuration here
```

## 🛡 Error Handling

The project includes comprehensive error handling:

- **Error Boundaries** for React component errors
- **Global Error Handler** for unhandled errors
- **Sentry Integration** for error monitoring
- **Custom Error Pages** (404, 500)

## 🎯 Performance

- **Bundle Analysis**: Use `npm run build:analyze` to analyze bundle size
- **Speed Insights**: Integrated Vercel Speed Insights
- **Core Web Vitals**: Optimized for performance metrics
- **Image Optimization**: Next.js Image component with optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention
This project follows [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📋 Todo

- [ ] Firebase integration
- [ ] Auth.js implementation
- [ ] Complete Sentry setup
- [ ] Add Sanity CMS integration
- [ ] Implement Clerk authentication
- [ ] Add Stripe payment integration
- [ ] Complete frosted glass effect
- [ ] Add more UI components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Join our community discussions

---

**Built with ❤️ using Next.js 15 and modern web technologies**