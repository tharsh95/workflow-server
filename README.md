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

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker

#### Production Mode

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Build and start the containers:

```bash
docker-compose up -d
```

#### Development Mode

For development with hot-reloading:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Access the API

Once the containers are running, the API will be available at:

- API: [http://localhost:3000](http://localhost:3000)
- MongoDB: localhost:27017

### Manual Setup (Without Docker)

If you prefer to run the application without Docker:

1. Install MongoDB
2. Install Node.js (v14+)
3. Clone the repository
4. Install dependencies:

```bash
npm install
```

5. Copy `.env.example` to `.env` and configure your environment variables
6. Start the application:

```bash
# Development
npm run dev

# Production
npm start
```

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

## License

[MIT](LICENSE) 