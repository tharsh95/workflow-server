# Workflow Management API

A RESTful API for managing automated workflows with steps like API calls and email notifications.

## Features

- Create, read, update, and delete workflows
- Execute workflows with various step types:
  - API calls
  - Email notifications
  - Conditional logic
  - Delays
  - Script execution
- Authentication and authorization
- MongoDB database for storage

## Getting Started

1. Clone the repository
   ```bash
   git clone <Repo_URL>
   ```

2. Install dependencies
   ```bash
   npm i
   ```

3. Copy `.env.example` to `.env` and configure your environment variables

4. Start the development server
   ```bash
   npm run dev
   ```

### Access the API

- API: [http://localhost:3000](http://localhost:3000)
- MongoDB: localhost:27017

### Prerequisites

- Node.js (v14+)
- MongoDB

## Email Configuration

For email functionality, set up Gmail credentials in the `.env` file:

```
USE_GMAIL=true
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here
```

Note: You need to use an "App Password" rather than your regular password.

## API Documentation

### Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/workflows` - Get all workflows for the authenticated user
- `GET /api/workflows/:id` - Get a single workflow
- `POST /api/workflows` - Create a new workflow
- `PUT /api/workflows/:id` - Update a workflow
- `DELETE /api/workflows/:id` - Delete a workflow
- `POST /api/workflows/:id/execute` - Execute a workflow


