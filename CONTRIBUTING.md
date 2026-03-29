# Contributing to CloudPulse Monitor

Thank you for your interest in contributing to CloudPulse Monitor! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be considerate of others, respect differing viewpoints, and focus on constructive feedback.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cloudpulse-monitor.git
   cd cloudpulse-monitor
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/cloudpulse-monitor.git
   ```

## Development Setup

### Prerequisites

- **Backend**: Java 25+, Gradle 8.x, PostgreSQL 15+
- **Frontend**: Node.js 18+, pnpm 8+
- **Docker**: Docker & Docker Compose (optional, for containerized development)

### Local Development

1. **Start the backend**:
   ```bash
   cd backend
   ./gradlew bootRun
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

3. **Run tests**:
   ```bash
   # Backend
   cd backend
   ./gradlew test

   # Frontend
   cd frontend
   pnpm lint
   pnpm type-check
   ```

See the [README.md](README.md) for detailed setup instructions.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Open a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Open a discussion or issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach

### Submitting Code

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following [coding standards](#coding-standards)

3. Write/update tests for your changes

4. Ensure all tests pass:
   ```bash
   # Backend
   ./gradlew test

   # Frontend
   pnpm lint && pnpm type-check
   ```

5. Commit your changes following [commit guidelines](#commit-guidelines)

6. Push to your fork and open a pull request

## Pull Request Process

1. **Update Documentation**: Ensure README.md and relevant docs reflect your changes

2. **Add Tests**: New features should include tests; bug fixes should include regression tests

3. **Follow the Template**: Use the PR template when opening pull requests

4. **Keep it Focused**: One feature/fix per PR for easier review

5. **Respond to Feedback**: Address review comments promptly

6. **Squash Commits**: Squash related commits before merging (maintainer will handle this)

## Coding Standards

### Backend (Java/Spring Boot)

- Follow standard Java naming conventions
- Use Spring annotations appropriately
- Write unit and integration tests
- Document public APIs with Javadoc

### Frontend (Vue/TypeScript)

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use Pinia for state management
- Follow the existing component structure:
  - UI components: `src/components/ui/`
  - Feature components: `src/components/{feature}/`
  - Views: `src/views/`
- Run linting before committing:
  ```bash
  pnpm lint
  pnpm format
  ```

### General

- Keep functions small and focused
- Write self-documenting code with clear naming
- Add comments only when necessary to explain "why"
- Maintain consistent formatting with the existing codebase

## Commit Guidelines

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or tooling changes

**Examples**:
```
feat: add WebSocket support for real-time monitor updates
fix: resolve memory leak in scheduler
docs: update deployment guide with Docker instructions
refactor: extract monitor validation into dedicated service
```

## Reporting Issues

When reporting issues, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Minimal steps to reproduce
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**:
   - OS: (e.g., Ubuntu 22.04, macOS 14, Windows 11)
   - Java version: (e.g., OpenJDK 25)
   - Node.js version: (e.g., v20.10.0)
   - PostgreSQL version: (e.g., 15.4)
6. **Screenshots**: If applicable
7. **Logs**: Relevant log output

---

Thank you for contributing to CloudPulse Monitor!
