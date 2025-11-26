# QQQ Frontend Material Dashboard

[![Version](https://img.shields.io/badge/version-0.26.0--SNAPSHOT-blue.svg)](https://github.com/Kingsrook/qqq-frontend-material-dashboard)
[![License](https://img.shields.io/badge/license-GNU%20Affero%20GPL%20v3-green.svg)](https://www.gnu.org/licenses/agpl-3.0.en.html)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.4-blue.svg)](https://www.typescriptlang.org/)
[![MUI](https://img.shields.io/badge/MUI-5.11.1-blue.svg)](https://mui.com/)

> **Frontend Component for QQQ - Low-code Application Framework for Engineers**

React-based user interface for the QQQ low-code platform, built with TypeScript and Material-UI.

## 🚀 Local Development

### Quick Start

```bash
# Install dependencies
npm run install:legacy

# Start development server (for testing directly)
npm start
# Opens at http://localhost:3000
```

### Package Installation

```bash
# Build and install for QQQ development locally
npm run build-and-install; mvn clean install
```

### Prerequisites

- **Node.js**: LTS version (18.x or higher)
- **npm**: 8.x or higher
- **Java**: 17 or higher (for full builds)
- **Maven**: 3.8+ (for full builds)
- **QQQ Server**: Running instance of the QQQ framework

## 🏗️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5 with custom theming
- **State Management**: React Context API with custom hooks
- **Routing**: React Router v6 with dynamic route generation
- **Authentication**: Auth0, OAuth2, and anonymous auth modules
- **Build Tool**: Create React App with TypeScript configuration

## 📁 Project Structure

```
src/
├── qqq/                    # QQQ-specific frontend code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages and views
│   ├── context/           # React context providers
│   ├── layouts/           # Page layout components
│   └── utils/             # Frontend utility functions
├── App.tsx                # Main application component
└── index.tsx              # Application entry point
```

## 📋 Available Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Start React dev server |
| `npm run build` | Build React for production |
| `npm test` | Run Jest tests |
| `npm run lint` | Check code quality |
| `npm run build-and-install` | Build and install for QQQ development |


## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# QQQ Server Configuration
REACT_APP_QQQ_API_BASE_URL=https://your-qqq-server.com/api
REACT_APP_QQQ_WS_BASE_URL=wss://your-qqq-server.com/ws

# Authentication (if using external providers)
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
```

### CI/CD Pipeline

For CI/CD environments, use Maven as the single build tool:

```bash
mvn clean package -Pci
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Building for Production

```bash
npm run build
```

The build process compiles TypeScript, optimizes assets, and generates production-ready files in the `build/` directory.

**Important**: The frontend must be configured to connect to a running QQQ server instance.

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# QQQ Server Configuration
REACT_APP_QQQ_API_BASE_URL=https://your-qqq-server.com/api
REACT_APP_QQQ_WS_BASE_URL=wss://your-qqq-server.com/ws

# Authentication (if using external providers)
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
```

## 🤝 Contributing

**Important**: This repository is a component of the QQQ framework. All contributions, issues, and discussions should go through the main QQQ repository.

1. Fork the main QQQ repository: https://github.com/Kingsrook/qqq
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and run tests: `npm test`
4. Open a Pull Request to the main QQQ repository

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

**Note**: This is a component of the QQQ framework. For complete information, support, and community, visit: https://github.com/Kingsrook/qqq


