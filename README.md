# PastraBeez E-Commerce Platform 🐝

A full-stack e-commerce application built with React, Node.js, Express, and MySQL.

## 🚀 Quick Start (One Command!)

### Prerequisites
- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- That's it! No Node.js, MySQL, or XAMPP needed.

### Run the Entire Application

1. **Clone or extract the project:**
   ```bash
   cd e-commerce
   ```

2. **Start everything with one command:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:3000
   - **MySQL:** localhost:3306

4. **Stop the application:**
   ```
   Press Ctrl+C in the terminal
   ```

5. **Clean up (remove containers and data):**
   ```bash
   docker-compose down -v
   ```

## 📦 What Docker Does

Docker runs **3 containers** for you:

1. **MySQL Database** (Port 3306)
   - Automatically creates the `mern_db` database
   - Loads the schema from `backend/database/schema.sql`
   - Loads sample data from `backend/database/sample.sql`
   - Data persists between restarts

2. **Backend API** (Port 3000)
   - Node.js + Express server
   - Connects to MySQL automatically
   - Hot-reloads when you change code

3. **Frontend** (Port 5173)
   - React + Vite application
   - Connects to backend API automatically
   - Hot-reloads when you change code

## 🗄️ Database Explanation

**Without Docker (old way):**
- You need XAMPP installed
- Manually start MySQL from XAMPP Control Panel
- Manually create database
- Manually import schema and data
- Database is outside the project

**With Docker (new way):**
- MySQL runs inside a Docker container
- Database is **part of the project**
- `schema.sql` automatically creates tables on first run
- `sample.sql` automatically loads test data on first run
- No XAMPP needed!
- Database data is saved in a Docker volume (persists between restarts)

## 🛠️ Development Commands

### View logs:
```bash
docker-compose logs -f
```

### Rebuild containers (after changing dependencies):
```bash
docker-compose up --build
```

### Stop containers:
```bash
docker-compose down
```

### Reset database (delete all data):
```bash
docker-compose down -v
docker-compose up --build
```

### Run backend only:
```bash
docker-compose up backend
```

### Run MySQL only:
```bash
docker-compose up mysql
```

## 🏗️ Project Structure

```
e-commerce/
├── backend/
│   ├── Dockerfile              # Backend container config
│   ├── database/
│   │   ├── schema.sql         # Database structure
│   │   └── sample.sql         # Sample data
│   ├── server.js
│   └── ...
├── frontend/
│   ├── Dockerfile              # Frontend container config
│   ├── src/
│   └── ...
├── docker-compose.yml          # Orchestrates all containers
└── README.md                   # This file
```

## 🎓 For Grading/Testing

**To run the complete application:**
1. Install Docker Desktop
2. Open terminal in project root
3. Run: `docker-compose up --build`
4. Wait ~2 minutes for initial setup
5. Open browser to http://localhost:5173

**Sample accounts (from sample.sql):**
- **Sellers:**
  - Email: `golden.hive@beehive.com`, Password: (see sample data)
  - Email: `nectar.farm@beehive.com`, Password: (see sample data)
  
- **Buyers:**
  - Email: `honey.lover@beehive.com`, Password: (see sample data)

## 🔧 Troubleshooting

**Port 3306 already in use:**
- Stop XAMPP MySQL
- Or change port in `docker-compose.yml`: `"3307:3306"`

**Port 5173 or 3000 already in use:**
- Stop other applications using these ports
- Or change ports in `docker-compose.yml`

**Changes not appearing:**
```bash
docker-compose down
docker-compose up --build
```

**Database not initializing:**
```bash
docker-compose down -v
docker-compose up --build
```

## 📝 Notes

- All changes to code are reflected immediately (hot reload)
- Database data persists in Docker volume `mysql_data`
- To reset everything: `docker-compose down -v && docker-compose up --build`
- First startup takes longer (building images + loading data)

## 🎉 Benefits of This Setup

✅ **One-command setup** - No complex installation steps  
✅ **No version conflicts** - Works the same on any machine  
✅ **Includes everything** - Database, backend, frontend  
✅ **Easy to grade** - No configuration needed  
✅ **Professional** - Industry-standard deployment method  
✅ **Portable** - Share the entire project easily  

---

**Built with ❤️ using React, Node.js, Express, MySQL, and Docker**
