# CONTRIBUTING GUIDELINES

##  Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git
- VS Code (recommended)

### Setup Development Environment

1. **Clone the repository**
   `ash
   git clone https://github.com/rahmivinnn/Exodus-Webapp.git
   cd Exodus-Webapp
   `

2. **Install dependencies**
   `ash
   npm install
   `

3. **Set up environment variables**
   `ash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   `

4. **Start development server**
   `ash
   npm run dev
   `

##  Development Workflow

### 1. Code Quality Standards

#### TypeScript
- Use strict TypeScript configuration
- Define proper types for all functions and variables
- Avoid ny type - use specific types instead
- Use interfaces for object shapes

#### Code Style
- Follow ESLint rules (run 
pm run lint)
- Use Prettier for formatting (run 
pm run format)
- Use meaningful variable and function names
- Add JSDoc comments for public functions

#### File Organization
- Keep components in components/ directory
- Keep utilities in lib/ directory
- Use barrel exports (index.ts) for clean imports
- Follow the existing folder structure

### 2. Git Workflow

#### Branch Naming
- eature/description - New features
- ix/description - Bug fixes
- efactor/description - Code refactoring
- docs/description - Documentation updates

#### Commit Messages
Use conventional commits format:
`
type(scope): description

Examples:
feat(calculator): add new equipment type
fix(validation): handle edge case in weight validation
docs(readme): update installation instructions
`

#### Pull Request Process
1. Create feature branch from main
2. Make your changes
3. Run tests and linting
4. Create pull request with detailed description
5. Address review feedback
6. Merge after approval

### 3. Testing

#### Unit Tests
- Write tests for all utility functions
- Test component behavior with different props
- Use Jest and React Testing Library

#### Integration Tests
- Test complete user workflows
- Test API integrations
- Use Cypress for E2E tests

#### Test Commands
`ash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
`

##  Architecture Guidelines

### Component Design

#### React Components
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Implement proper error boundaries

#### State Management
- Use React hooks for local state
- Use Context API for global state
- Consider Redux for complex state management

#### Styling
- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use consistent spacing and colors
- Implement dark mode support

### API Design

#### RESTful APIs
- Use proper HTTP methods
- Implement proper status codes
- Use consistent naming conventions
- Add proper error handling

#### Data Validation
- Use Zod for schema validation
- Validate input on both client and server
- Provide clear error messages

##  Bug Reports

### Before Reporting
1. Check existing issues
2. Search documentation
3. Try to reproduce the issue
4. Check browser console for errors

### Bug Report Template
`markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]

## Additional Context
Any other context about the problem
`

##  Feature Requests

### Before Requesting
1. Check existing features
2. Search existing issues
3. Consider if it fits the project scope

### Feature Request Template
`markdown
## Feature Description
Brief description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Any other context about the feature request
`

##  Documentation

### Code Documentation
- Add JSDoc comments for all public functions
- Document complex algorithms
- Include usage examples
- Keep documentation up to date

### README Updates
- Update README when adding new features
- Include setup instructions
- Add troubleshooting section
- Keep examples current

##  Tools and Setup

### Recommended VS Code Extensions
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### Development Scripts
`ash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
npm run clean        # Clean build artifacts
`

##  Security

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Keep dependencies updated
- Use HTTPS in production

### Reporting Security Issues
- Email security issues to: security@exoduslogistix.com
- Do not create public issues for security vulnerabilities
- Include steps to reproduce
- Provide your contact information

##  Support

### Getting Help
1. Check this documentation
2. Search existing issues
3. Ask in team chat
4. Create new issue if needed

### Contact Information
- Development Team: dev@exoduslogistix.com
- Project Lead: lead@exoduslogistix.com
- General Support: support@exoduslogistix.com

---

**Thank you for contributing to Exodus Logistix! **
