# CodeProjekt Dashboard Frontend

A modern, responsive dashboard application built with React, TypeScript, and Vite. Features a beautiful UI with dark/light theme support, interactive charts, and a component-based architecture.

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Routing](#routing)
- [Theming](#theming)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

- 📊 **Interactive Dashboard** - E-commerce metrics, charts, and statistics
- 🎨 **Dark/Light Mode** - Theme switcher with persistent preferences
- 📱 **Responsive Design** - Mobile-first approach using Tailwind CSS
- 📈 **Data Visualization** - ApexCharts integration for beautiful charts
- 🧩 **Reusable Components** - Modular UI component library
- 🎯 **Type-Safe** - Full TypeScript support
- 🚀 **Fast Development** - Vite for lightning-fast HMR
- 🔄 **React Router** - Client-side routing with React Router v7
- 🖼️ **SVG as Components** - SVG icons imported as React components

## 🛠️ Tech Stack

### Core

- **React 19.1.1** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.7** - Build tool and dev server

### UI & Styling

- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **tailwind-merge** - Merge Tailwind classes intelligently

### Routing

- **React Router DOM 7.9.4** - Client-side routing

### Charts & Visualization

- **ApexCharts 5.3.5** - Modern charting library
- **react-apexcharts 1.8.0** - React wrapper for ApexCharts

### Additional Libraries

- **Swiper 12.0.2** - Modern touch slider
- **Flatpickr 4.6.13** - Lightweight date picker
- **vite-plugin-svgr** - Import SVGs as React components

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS** - CSS transformations

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher) or **yarn**

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/biswajit-debnath/codeproject-dashboard.git
   cd codeprojekt-dashboard-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## 🏃 Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Preview Production Build

Build and preview the production version:

```bash
npm run build
npm run preview
```

## 🔨 Building for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

## 📁 Project Structure

```
codeprojekt-dashboard-frontend/
├── public/                     # Static assets
│   └── vite.svg
├── src/
│   ├── assets/                # Images and static resources
│   │   └── react.svg
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Common components
│   │   │   ├── ChartTab.tsx
│   │   │   └── ThemeToggleButton.tsx
│   │   ├── ecommerce/        # E-commerce specific components
│   │   │   ├── CountryMap.tsx
│   │   │   ├── DemographicCard.tsx
│   │   │   ├── EcommerceMetrics.tsx
│   │   │   ├── MonthlySalesChart.tsx
│   │   │   ├── MonthlyTarget.tsx
│   │   │   ├── RecentOrders.tsx
│   │   │   └── StatisticsChart.tsx
│   │   ├── header/           # Header components
│   │   │   ├── NotificationDropdown.tsx
│   │   │   └── UserDropdown.tsx
│   │   └── ui/               # Generic UI components
│   │       ├── alert/
│   │       ├── avatar/
│   │       ├── badge/
│   │       ├── button/
│   │       ├── dropdown/
│   │       ├── images/
│   │       ├── modal/
│   │       ├── table/
│   │       └── videos/
│   ├── context/              # React Context providers
│   │   ├── SidebarContext.tsx
│   │   └── ThemeContex.tsx
│   ├── icons/                # SVG icon components
│   │   ├── *.svg            # Individual SVG files
│   │   └── index.ts         # Icon exports
│   ├── layout/               # Layout components
│   │   ├── AppHeader.tsx
│   │   ├── AppLayout.tsx
│   │   └── AppSidebar.tsx
│   ├── pages/                # Page components
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   └── Transactions/
│   │   └── Transactions/
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Application entry point
│   ├── App.css               # App-specific styles
│   ├── index.css             # Global styles
│   └── vite-env.d.ts        # Vite type declarations
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TS config
├── tsconfig.node.json        # Node-specific TS config
├── vite.config.ts            # Vite configuration
├── eslint.config.js          # ESLint configuration
└── README.md                 # This file
```

## 🧩 Key Components

### Layout Components

- **AppLayout** - Main application layout with header and sidebar
- **AppHeader** - Top navigation bar with notifications and user menu
- **AppSidebar** - Side navigation menu

### E-commerce Components

- **EcommerceMetrics** - Dashboard metrics cards
- **MonthlySalesChart** - Bar chart showing monthly sales data
- **MonthlyTarget** - Target achievement visualization
- **StatisticsChart** - Multi-series line chart for statistics
- **RecentOrders** - Table of recent order data
- **DemographicCard** - User demographic information
- **CountryMap** - Geographic data visualization

### UI Components

- **Alert** - Notification alerts (success, error, warning, info)
- **Avatar** - User avatar component
- **Badge** - Status badges
- **Button** - Reusable button component
- **Dropdown** - Dropdown menu component
- **Modal** - Modal dialog component
- **Table** - Data table component
- **Images** - Responsive image grids
- **Videos** - Aspect ratio video players

## 🛣️ Routing

The application uses React Router v7 for client-side routing:

```tsx
Routes:
  / - Home page (Dashboard)
  /transactions - Transactions page
```

### Adding New Routes

Edit `src/App.tsx`:

```tsx
<Route path="/your-route" element={<YourComponent />} />
```

## 🎨 Theming

### Dark/Light Mode

The application supports dark and light themes via the `ThemeContext`:

```tsx
import { useTheme } from "./context/ThemeContex";

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return <button onClick={toggleTheme}>Current theme: {theme}</button>;
}
```

Theme preference is persisted in `localStorage` and automatically applied on page load.

### Customizing Tailwind

Tailwind CSS is configured with dark mode support. Use the `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-white">Hello</h1>
</div>
```

## 🔧 Configuration Files

### TypeScript Configuration

- **tsconfig.json** - Base TypeScript configuration
- **tsconfig.app.json** - Application-specific config
- **tsconfig.node.json** - Node.js-specific config

### Vite Configuration

`vite.config.ts` includes:

- React plugin for Fast Refresh
- SVGR plugin for SVG-as-components

### ESLint Configuration

`eslint.config.js` provides linting rules for React and TypeScript.

## 🐛 Troubleshooting

### Common Issues

#### 1. **Nothing renders in the browser**

**Solution:** Check browser console for errors. Common causes:

- Missing dependencies: Run `npm install`
- SVG import errors: Ensure `vite-plugin-svgr` is installed
- Port conflict: Vite defaults to port 5173

#### 2. **SVG imports failing**

**Error:** `does not provide an export named 'ReactComponent'`

**Solution:**

- Ensure `vite-plugin-svgr` is installed: `npm install -D vite-plugin-svgr`
- Check `vite.config.ts` includes the svgr plugin
- Import SVGs as: `import IconName from './icon.svg?react'`

#### 3. **ApexOptions type error**

**Error:** `'ApexOptions' is a type and must be imported using a type-only import`

**Solution:** Use type-only import:

```tsx
import type { ApexOptions } from "apexcharts";
```

#### 4. **React Router conflicts**

**Error:** Module conflicts between `react-router` and `@tanstack/react-router`

**Solution:** Uninstall conflicting router packages:

```bash
npm uninstall @tanstack/react-router @tanstack/router-devtools @tanstack/router-plugin
```

#### 5. **Dark mode not working**

- Ensure `ThemeProvider` wraps your app in `main.tsx`
- Check localStorage for saved theme preference
- Verify Tailwind's dark mode configuration

### Development Server Issues

If the dev server won't start:

1. **Clear node_modules and reinstall:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check port availability:**

   ```bash
   lsof -ti:5173
   ```

3. **Try a different port:**
   ```bash
   npm run dev -- --port 3000
   ```

## 📜 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and not licensed for public use.

## 👤 Author

**Biswajit Debnath**

- GitHub: [@biswajit-debnath](https://github.com/biswajit-debnath)

## 🙏 Acknowledgments

- React team for an amazing framework
- Vite team for the blazing-fast build tool
- Tailwind CSS for the utility-first CSS framework
- ApexCharts for beautiful chart components

---

Made with ❤️ using React, TypeScript, and Vite
