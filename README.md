# Pet Adoption System - Backend

The backend service for the Pet Adoption System, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v24.12.0 recommended)
- MongoDB

## Installation

1. Navigate to the backend directory:
   ```bash
   cd pet-adoption-system-be
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory based on `.env.sample`. The following variables are typically required:

```env
PORT=9001
MONGO_URL=mongodb://127.0.0.1:27017/pet-adoption
CORS_URL=http://localhost:5173
JWT_SECRET=your_secret_key
```

## Running the Application

### Development Mode

Runs the server with `nodemon` for hot-reloading.

```bash
npm run dev
```

### Production Mode

Runs the server using `node`.

```bash
npm start
```

## Admin Seeding

To create a default admin user, run the seeding script:

```bash
npm run seed
```

**Default Admin Credentials:**

- **Email:** admin@admin.com
- **Password:** admin@123
- **Role:** admin

This script will check if the admin user exists and create it only if it's missing.
