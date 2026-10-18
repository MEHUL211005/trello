# TaskSphere

**TaskSphere is a collaborative project management system.** Teams organise work across workspaces, boards, lists and cards with drag-and-drop, checklists, labels, attachments, comments and activity tracking.

This repo is the frontend. The API lives in a separate [`trello_backend`](../trello_backend) project (Express + MySQL/Sequelize).

## Features

- Workspaces and boards with member management
- Lists and cards with drag-and-drop reordering (`@dnd-kit`)
- Card details: descriptions, due dates, labels, checklists, attachments, and comments
- Activity log per card/board
- Authentication: sign up with email OTP verification, login, forgot / reset password, protected routes
- Board filtering and view switching
- User feedback submission

## Tech Stack

- **React 19** + **Vite**
- **Redux Toolkit** + **redux-persist** for state management
- **TanStack Query** for server state/data fetching
- **React Router** for routing
- **React Hook Form** + **Zod** for form handling and validation
- **Tailwind CSS 4** for styling
- **dnd-kit** for drag-and-drop
- **Axios** for HTTP requests

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- The [backend API](../trello_backend) running locally (or a deployed instance)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the project root pointing to your backend API, e.g.:

```
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── api/          # Axios API calls per resource (board, card, list, auth, etc.)
├── components/   # Reusable UI components (Board, List, Card, modals, popovers)
│   └── card/     # Card detail modal sub-components
├── layouts/       # App layout shell
├── lib/          # Shared client setup (e.g. React Query client)
├── pages/        # Route-level pages (Dashboard, Workspace, Login, Signup, Profile)
├── redux/        # Redux slices and store
├── routes/       # App route definitions
└── validations/  # Zod schemas
```
