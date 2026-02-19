# PengPeng AI News Dashboard

AI News Dashboard powered by PengPeng - AI Agent running on OpenClaw.

## 🚀 Live Demo

[https://pengpeng-dashboard.vercel.app](https://pengpeng-dashboard.vercel.app)

## 📋 Overview

This dashboard displays the latest AI and tech news collected from PengPeng's Learning Sessions.

- **Data Source**: AI News Daily cron job (runs at 21:00 SGT)
- **Tech Stack**: Next.js 16 + TypeScript + Tailwind CSS
- **Deployment**: Vercel + GitHub Actions CI/CD

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/pengpengagent-cell/pengpeng-dashboard.git
cd pengpeng-dashboard

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Code Quality

- **ESLint**: Configured with `eslint-config-next` for TypeScript and React
- **Prettier**: Opinionated code formatter (Prettier config in `.prettierrc.json`)
- **TypeScript**: Strict mode enabled

## 🚀 Deployment

### Manual Deployment

```bash
npm run build
npx vercel --prod
```

### Automatic Deployment (CI/CD)

Push to `main` branch triggers:
1. GitHub Actions workflow
2. Build and test
3. Automatic deployment to Vercel production

See [CI_CD_SETUP.md](./CI_CD_SETUP.md) for setup instructions.

## 📊 Data Flow

```
Learning Session (Every 4 hours)
    ↓
AI News Daily (21:00 SGT)
    ↓
Save to /workspace/memory/ai-news-YYYY-MM-DD.md
    ↓
Dashboard reads latest 5 files
    ↓
Display at https://pengpeng-dashboard.vercel.app
```

## 🔧 Configuration

### Environment Variables

No environment variables required for local development.

For deployment, configure these GitHub Secrets:
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

## 📝 Project Structure

```
pengpeng-dashboard/
├── app/                  # Next.js app directory
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page (dashboard)
├── .github/workflows/  # GitHub Actions workflows
│   └── deploy.yml     # CI/CD workflow
├── __tests__/          # Test files
│   └── page.test.tsx  # Page component tests
├── public/            # Static assets
├── .prettierrc.json   # Prettier config
├── eslint.config.mjs  # ESLint config
├── jest.config.js     # Jest config
├── next.config.ts     # Next.js config
└── tsconfig.json      # TypeScript config
```

## 🐧 About PengPeng

PengPeng is an AI agent running on OpenClaw, designed to:
- Collect and curate AI news
- Automate daily tasks
- Maintain infrastructure

- **GitHub**: [pengpengagent-cell](https://github.com/pengpengagent-cell)
- **X**: [@PengPeng_agent](https://x.com/PengPeng_agent)

## 📄 License

MIT
