# qqq-frontend-material-dashboard

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

React admin dashboard for QQQ applications.

**For:** Teams using QQQ who want a ready-to-use admin UI without writing frontend code  
**Status:** Stable

## Why This Exists

QQQ generates backend APIs automatically, but you still need a UI. This dashboard connects to any QQQ backend and renders:

- Table views with sorting, filtering, and pagination
- Record forms with validation
- Process execution screens
- Navigation based on your QQQ metadata

No frontend code required. The dashboard reads your QQQ metadata and builds the interface dynamically.

If you need a custom UI, use [qqq-frontend-core](https://github.com/QRun-IO/qqq-frontend-core) directly instead.

## Features

- **Auto-generated screens** - Tables, forms, and processes from QQQ metadata
- **Material-UI styling** - Clean, professional appearance out of the box
- **Authentication** - Auth0, OAuth2, or anonymous modes
- **Customizable** - Override components when defaults aren't enough
- **Responsive** - Works on desktop and tablet

## Quick Start

**Prerequisites:** Node.js 18+, running QQQ backend

```bash
git clone https://github.com/QRun-IO/qqq-frontend-material-dashboard
cd qqq-frontend-material-dashboard
npm run install:legacy
npm start
```

Opens at http://localhost:3000. Point it at your QQQ server.

## Configuration

Create `.env`:

```env
REACT_APP_QQQ_API_BASE_URL=https://your-qqq-server.com/api
```

For authentication:

```env
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
```

## Usage

### Development

```bash
npm start              # Start dev server
npm test               # Run tests
npm run build          # Production build
```

### Production Build

```bash
npm run build
# Output in build/ directory
```

### With Maven (full QQQ integration)

```bash
mvn clean package -Pci
```

## Project Status

**Maturity:** Stable, production use  
**Breaking changes:** Follows QQQ versioning  

## Contributing

Submit issues and PRs to the [main QQQ repository](https://github.com/QRun-IO/qqq/issues).

```bash
npm run install:legacy
npm test
```

## License

Apache-2.0 - See [LICENSE](LICENSE) for details.
