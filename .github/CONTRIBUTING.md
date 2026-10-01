# Contributing to QQQ Frontend Material Dashboard

Thank you for your interest in contributing to the QQQ Frontend Material Dashboard! This repository contains the **frontend dashboard application** that runs on top of the QQQ framework.

## 🎯 What This Repository Is

This repository is a **frontend component** of the QQQ framework that provides:
- React-based user interface components
- Material-UI theming and styling
- Client-side routing and state management
- Authentication UI components
- Data visualization and form components

## 🚫 What This Repository Is NOT

This repository does NOT contain:
- The QQQ server or backend
- Core framework functionality
- Business logic or process engine
- Database operations or API endpoints

## 🔄 Contribution Types

### ✅ Frontend-Only Changes (This Repository)

- **UI/UX improvements** to existing components
- **New React components** for the dashboard
- **Styling and theming** updates
- **Frontend performance** optimizations
- **Client-side bug fixes**
- **Documentation updates** for frontend code

### ❌ Backend/Core Changes (Main QQQ Repository)

- **Server-side functionality**
- **Core framework features**
- **Database schema changes**
- **API endpoint modifications**
- **Business logic changes**
- **Process engine updates**

## 🚀 Getting Started

### Prerequisites

- **Node.js**: LTS version (20.x or higher)
- **npm**: 8.x or higher
- **Git**: For version control
- **QQQ Server**: Running instance for testing

### Development Setup

1. **Fork this repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/qqq-frontend-material-dashboard.git
   cd qqq-frontend-material-dashboard
   ```
3. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Use strict typing
- **ESLint**: Follow the configured rules
- **Prettier**: Maintain consistent formatting
- **React**: Use functional components with hooks
- **Material-UI**: Follow MUI design patterns

### Component Structure

```typescript
// Example component structure
import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ExampleComponent({ title, children }: Props): JSX.Element {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {children}
    </Box>
  );
}
```

### Testing

- **Unit tests**: Test individual components
- **Integration tests**: Test component interactions
- **Browser testing**: Test in multiple browsers
- **Responsive testing**: Test on different screen sizes

## 🔄 Pull Request Process

1. **Ensure your changes are frontend-only**
2. **Follow the existing code patterns**
3. **Add tests for new functionality**
4. **Update documentation if needed**
5. **Test thoroughly in the browser**
6. **Submit a pull request**

### PR Checklist

- [ ] Changes are frontend-focused only
- [ ] Code follows existing patterns
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes introduced
- [ ] Cross-browser compatibility verified

## 🚨 For Major Changes

If your contribution involves:
- **Core framework functionality**
- **Backend integration changes**
- **Major architectural decisions**
- **Breaking changes to the QQQ API**

Please submit to the **main QQQ repository** instead:
👉 **[https://github.com/Kingsrook/qqq](https://github.com/Kingsrook/qqq)**

## 🐛 Reporting Issues

**All issues should be reported to the main QQQ repository:**
👉 **[https://github.com/Kingsrook/qqq/issues](https://github.com/Kingsrook/qqq/issues)**

When reporting frontend-specific issues, include:
- Browser and version
- Operating system
- Steps to reproduce
- Screenshots if applicable
- Console errors
- QQQ server version

## 💬 Getting Help

- **Documentation**: [QQQ Wiki](https://github.com/Kingsrook/qqq.wiki)
- **Discussions**: [QQQ Discussions](https://github.com/Kingsrook/qqq/discussions)
- **Main Repository**: [https://github.com/Kingsrook/qqq](https://github.com/Kingsrook/qqq)

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (Apache License, Version 2.0).

## 🙏 Thank You

Thank you for contributing to the QQQ Frontend Material Dashboard! Your contributions help make the QQQ framework's user interface better for everyone.

---

**Remember**: This is a frontend component. For core QQQ functionality, use the main repository: https://github.com/Kingsrook/qqq
