# 🚀 QUICK START GUIDE

## For Your Teacher/Grader:

### Step 1: Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop
- Windows: Download and install
- Mac: Download and install
- Linux: Follow Docker installation guide

### Step 2: Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (whale icon in taskbar)

### Step 3: Run the Application
Open terminal/PowerShell in the project folder and run:
```bash
docker-compose up --build
```

Wait 2-3 minutes for:
- ✅ MySQL database to initialize
- ✅ Backend server to start
- ✅ Frontend to build and start

### Step 4: Access the Application
Open your browser to: **http://localhost:5173**

---

## That's it! 🎉

Everything runs automatically:
- MySQL database with sample data
- Backend API server
- Frontend React application

## To Stop:
Press `Ctrl + C` in the terminal

## To Restart:
```bash
docker-compose up
```

## To Reset Everything (fresh start):
```bash
docker-compose down -v
docker-compose up --build
```

---

## Why Docker?

**Without Docker**, you would need to install:
1. Node.js (specific version)
2. MySQL or XAMPP
3. Configure database manually
4. Install npm packages
5. Set up environment variables
6. Start multiple terminals

**With Docker**:
1. Install Docker Desktop
2. Run one command
3. Done! ✅

---

## Sample Login Credentials

**Seller Account:**
- Email: `golden.hive@beehive.com`
- Password: (check sample.sql file)

**Buyer Account:**
- Email: `honey.lover@beehive.com`
- Password: (check sample.sql file)

---

## Troubleshooting

**"Port already in use" error?**
- Make sure XAMPP is stopped
- Or change ports in docker-compose.yml

**Nothing happening after docker-compose up?**
- Check Docker Desktop is running
- Wait a few minutes (first run is slow)

**Need help?**
- Check the full README.md for detailed docs
