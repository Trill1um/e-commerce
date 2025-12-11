# E-Commerce Platform

A full-stack e-commerce application built with React, Node.js, Express, and MySQL, featuring a honey-themed marketplace with seller and buyer functionality.

## Prerequisites

Before running this project, you need to have Docker Desktop installed on your system.

**Download Docker Desktop:** [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

- Download and install Docker Desktop for Windows
- Make sure Docker Desktop is running before executing any commands
- Verify installation by running `docker --version` in PowerShell

## Project Setup

This project uses batch files to simplify Docker operations. All commands should be run from the project root directory.

### Available Commands

#### 1. **Setup (First Time Only)**
```powershell
.\setup.bat
```
**What it does:**
- Builds all Docker images for the first time
- Sets up the MySQL database, backend server, and frontend application
- Run this command only once when you first clone the project

#### 2. **Start the Application**
```powershell
.\run.bat
```
**What it does:**
- Starts all Docker containers in detached mode
- Displays logs from all services (frontend, backend, MySQL)
- Press `Ctrl+C` to stop viewing logs (containers continue running)

**Access the application:**
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

#### 3. **Stop the Application**
```powershell
.\stop.bat
```
**What it does:**
- Stops all running Docker containers
- Preserves your data (database remains intact)

#### 4. **Reset Database**
```powershell
.\reset.bat
```
**What it does:**
- Stops all containers
- Removes all containers and volumes (deletes database data)
- Rebuilds everything from scratch
- Reinitializes the database with sample data
- Use this when you want a fresh start or if the database gets corrupted

## Typical Workflow

### First Time Setup:
```powershell
# 1. Install Docker Desktop and ensure it's running
# 2. Clone the project and navigate to the directory
.\setup.bat
```

### Daily Development:
```powershell
# Start the application
.\run.bat

# Work on your project...
# Press Ctrl+C to stop viewing logs when done

# Stop the application when finished
.\stop.bat
```

### When You Need a Fresh Database:
```powershell
.\reset.bat
```

## Database Structure

The project uses a composite primary key design for academic correctness (weak entity relationship):

- **PRODUCT table**: Composite primary key `(code, seller_id)`
- **IMAGE table**: References product with `(code, seller_id)`
- **INFO table**: References product with `(code, seller_id)`
- **RATING table**: Composite key `(code, seller_id, user_id)`

The application layer uses synthetic IDs (format: `"sellerId-code"`) for simpler frontend code while maintaining the composite key structure in the database.

## Sample Users

After running `setup.bat` or `reset.bat`, the following users are available:

**Admin User:**
- Email: admin@email.com
- Password: 123456

**Seller Accounts:**
- Golden Hive: goldenhive@email.com / 123456
- Sweet Nectar: sweetnectar@email.com / 123456
- Buzzing Artisans: buzzingartisans@email.com / 123456

**Buyer Account:**
- Email: buyer@email.com / 123456

## Troubleshooting

### Docker not found
Make sure Docker Desktop is installed and running. Check with:
```powershell
docker --version
```

### Port already in use
If ports 3306, 5000, or 5173 are already in use, stop other applications using those ports or modify the port mappings in `docker-compose.yml`.

### Database connection errors
Run the reset script to reinitialize everything:
```powershell
.\reset.bat
```

### Containers not starting
Ensure Docker Desktop is running and has sufficient resources allocated (Settings → Resources).

## Technology Stack

- **Frontend**: React, Vite, TailwindCSS, React Query (TanStack Query)
- **Backend**: Node.js, Express, MySQL2
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **State Management**: Zustand
- **Image Upload**: Cloudinary

## Development Notes

- Query logging is enabled in the backend to show actual SQL queries with parameter values
- The admin panel (`/admin` route) shows raw database tables without synthetic ID abstraction
- React Query handles cache invalidation for most CRUD operations
- The admin panel refreshes data on every page navigation