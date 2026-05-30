📦 d:\platform_learn
│
├── 📄 Root Files
│   ├── package.json (workspace monorepo)
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── tsconfig.base.json
│   ├── tsconfig.json
│   ├── README.md
│   ├── .npmrc
│   ├── .gitignore
│   ├── .hintrc
│   └── .replit
│
├── 🗂️ .agents/ (Git Agents)
├── 🗂️ .git/ (Version Control)
├── 🗂️ .local/ (Local config)
├── 🗂️ node_modules/ (Dependencies)
│
├── 📦 artifacts/ (Project Artifacts)
│   ├── api-server/ (Backend Express/Node.js)
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── index.ts
│   │   │   ├── lib/
│   │   │   │   └── logger.ts
│   │   │   ├── middlewares/ (.gitkeep)
│   │   │   └── routes/
│   │   │       ├── index.ts
│   │   │       ├── health.ts
│   │   │       ├── assignments.ts
│   │   │       ├── course.ts
│   │   │       └── user.ts
│   │   ├── dist/ (Build output)
│   │   ├── build.mjs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env
│   │   ├── .replit-artifact/
│   │   └── node_modules/
│   │
│   ├── mobile/ (React Native - Expo)
│   │   ├── app/ (File-based routing)
│   │   │   ├── index.tsx (Home)
│   │   │   ├── _layout.tsx
│   │   │   ├── +not-found.tsx
│   │   │   ├── (tabs)/ (Tab navigation)
│   │   │   │   ├── _layout.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── (auth)/ (Auth flows)
│   │   │   │   ├── _layout.tsx
│   │   │   │   └── login.tsx
│   │   │   ├── (admin)/ (Admin panel)
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── users.tsx
│   │   │   │   ├── courses.tsx
│   │   │   │   └── settings.tsx
│   │   │   ├── (instructor)/ (Instructor dashboard)
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── courses.tsx
│   │   │   │   ├── assignments.tsx
│   │   │   │   └── profile.tsx
│   │   │   ├── (student)/ (Student dashboard)
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── courses.tsx
│   │   │   │   ├── assignments.tsx
│   │   │   │   └── profile.tsx
│   │   │   └── course/
│   │   │       └── [id].tsx (Dynamic course page)
│   │   ├── components/ (Reusable Components)
│   │   │   ├── AssignmentCard.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ErrorFallback.tsx
│   │   │   ├── KeyboardAwareScrollViewCompat.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── UserCard.tsx
│   │   ├── assets/
│   │   │   ├── fonts/
│   │   │   └── images/
│   │   ├── constants/
│   │   │   └── colors.ts
│   │   ├── context/ (State management)
│   │   │   ├── AuthContext.tsx
│   │   │   └── DataContext.tsx
│   │   ├── hooks/
│   │   │   └── useColors.ts
│   │   ├── scripts/
│   │   │   ├── build.js
│   │   │   └── serve.js
│   │   ├── server/
│   │   │   ├── serve.js
│   │   │   └── templates/
│   │   │       └── landing-page.html
│   │   ├── app.json (Expo config)
│   │   ├── babel.config.js
│   │   ├── metro.config.js
│   │   ├── expo-env.d.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   ├── .expo/
│   │   ├── .gitignore
│   │   ├── .replit-artifact/
│   │   └── node_modules/
│   │
│   └── mockup-sandbox/ (Vite + React Preview)
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── index.css
│       │   ├── .generated/
│       │   ├── components/
│       │   │   ├── mockups/
│       │   │   └── ui/
│       │   ├── hooks/
│       │   │   ├── use-mobile.tsx
│       │   │   └── use-toast.ts
│       │   └── lib/
│       │       └── utils.ts
│       ├── components.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── mockupPreviewPlugin.ts
│       ├── tsconfig.json
│       ├── package.json
│       ├── .replit-artifact/
│       └── node_modules/
│
├── 📦 lib/ (Shared Libraries)
│   ├── api-client-react/ (React API Client)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── custom-fetch.ts
│   │   │   └── generated/
│   │   │       ├── api.ts
│   │   │       └── api.schemas.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.tsbuildinfo
│   │   └── node_modules/
│   │
│   ├── api-spec/ (OpenAPI Specification)
│   │   ├── openapi.yaml
│   │   ├── orval.config.ts
│   │   ├── package.json
│   │   └── node_modules/
│   │
│   ├── api-zod/ (Zod Schemas for API)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── generated/
│   │   │       ├── api.ts
│   │   │       └── types/
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.tsbuildinfo
│   │   └── node_modules/
│   │
│   └── db/ (Database/Drizzle ORM)
│       ├── src/
│       │   ├── index.ts
│       │   └── schema/ (Database schemas)
│       ├── drizzle.config.ts
│       ├── dist/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       └── node_modules/
│
└── 📦 scripts/ (Utility Scripts)
    ├── src/
    │   └── hello.ts
    ├── post-merge.sh
    ├── package.json
    └── tsconfig.json