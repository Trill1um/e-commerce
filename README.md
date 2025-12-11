# 🍯 PastraBeez: E-Commerce Platform Made for Students by Students

## 1. Project Overview & Objectives

**PastraBeez** is a full-stack e-commerce web application featuring a honey-themed marketplace with comprehensive seller and buyer functionality. The platform enables artisan honey producers to showcase their products while providing customers with a seamless shopping experience.

This project was developed to meet the following objectives of the **IT 211: Database Management System** course:

* **Demonstrate understanding of database concepts and design.** Implementation of ERD, composite primary keys (weak entity relationships), and normalization principles.
* **Apply knowledge of SQL, CRUD operations, and relational databases.** Full Create, Read, Update, Delete functionality across all entities with complex JOIN queries.
* **Develop a functional system with a user-friendly interface.** Intuitive React-based GUI with seamless navigation and user-centered design principles.

***

## 2. Project Scope & Architecture

### 🛠️ Tools and Technologies

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend (GUI)** | **React + Vite** | Component-based user interface with hot module replacement. |
| **Styling** | **TailwindCSS** | Utility-first CSS framework for responsive design. |
| **State Management** | **Zustand** | Lightweight client-side state management. |
| **Server State** | **React Query (TanStack Query)** | Server state management, caching, and automatic refetching. |
| **Backend** | **Node.js + Express** | RESTful API server handling business logic. |
| **Database** | **MySQL 8.0** | Relational database management system. |
| **Database Connector** | **mysql2** | MySQL driver with Promise support for Node.js. |
| **Authentication** | **JWT + bcryptjs** | Secure token-based authentication with password hashing. |
| **Image Storage** | **Cloudinary** | Cloud-based image upload and management. |
| **Containerization** | **Docker + Docker Compose** | Consistent development environment across all platforms. |
| **Language** | **JavaScript (ES6+), SQL** | Used for application logic and data manipulation. |

### 🚀 System Architecture

The system utilizes a **Three-Tier Architecture**:

1. **Presentation Tier:** React frontend running on Vite dev server (port 5173)
2. **Application Tier:** Express backend API server (port 5000) handling business logic and authentication
3. **Data Tier:** MySQL database (port 3306) with composite key schema

All three tiers are containerized using Docker Compose for consistent deployment. The frontend communicates with the backend via RESTful API calls, and the backend connects to MySQL using connection pooling for optimal performance.

***

## 3. Database Design and Implementation

The system is built upon a **5-table relational schema** implementing composite primary keys for weak entity relationships.

### 📊 Schema and Relationships

The database, named `ecommerce`, consists of core entity tables with composite key relationships:

| Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- |
| **`USER`** | Master list of all users (admin, sellers, buyers). | One-to-Many (1:M) to `PRODUCT` (as seller), One-to-Many to `RATING`. |
| **`PRODUCT`** | **Weak Entity** - Product catalog with composite primary key. | Primary Key: `(code, seller_id)`. One-to-Many to `IMAGE`, `INFO`, `RATING`. |
| **`IMAGE`** | **Dependent Entity** - Product images with references. | Composite PK: `(image_index, code, seller_id)`. Foreign Key to `PRODUCT`. |
| **`INFO`** | **Dependent Entity** - Flexible product attributes (key-value pairs). | Composite PK: `(info_index, code, seller_id)`. Foreign Key to `PRODUCT`. |
| **`RATING`** | Customer reviews and ratings for products. | Composite PK: `(code, seller_id, user_id)`. Foreign Keys to `PRODUCT` and `USER`. |

### 📁 Database Scripts

The entire database can be deployed using the following scripts located in the `backend/database/` folder:

1. **`schema.sql`**: Creates the database and all 5 tables with:
   * Composite primary key definitions
   * Foreign key constraints with CASCADE operations
   * AUTO_INCREMENT configurations
   * ENUM types for roles and product status

2. **`sample.sql`**: Populates the tables with interconnected sample records:
   * Admin user and 3 seller accounts (Golden Hive, Sweet Nectar, Buzzing Artisans)
   * 15 honey products (5 per seller) with explicit code values
   * Product images hosted on Cloudinary
   * Product information (origin, harvest date, etc.)
   * Sample customer ratings

***

## 4. Application Functionality

The application implements comprehensive **CRUD operations** across all entities with role-based access control and user-centered design principles.

### 1. User Authentication & Authorization
* **CRUD:** User registration with email verification, login with JWT tokens
* **Roles:** Admin, Seller, Buyer (role-based route protection)
* **Security:** Password hashing with bcrypt, HTTP-only cookies for refresh tokens

### 2. Product Management (Sellers)
* **Create:** Multi-step form for adding products with image upload (Cloudinary)
* **Read:** View own products in seller dashboard with synthetic IDs
* **Update:** Edit product details, price, stock, status (available/unavailable)
* **Delete:** Remove products (cascades to IMAGE, INFO, RATING via foreign keys)
* **Interconnectivity:** Products automatically linked to authenticated seller's `user_id`

### 3. Product Catalog (Buyers)
* **Read:** Browse all available products with filtering by category
* **Search:** Real-time search functionality across product names and descriptions
* **View Details:** Comprehensive product page with image carousel, seller info, ratings
* **Category Filter:** Dynamic filtering (Raw Honey, Flavored Honey, Honeycomb, etc.)

### 4. Rating System
* **Create:** Buyers can rate and review purchased products (1-5 stars)
* **Read:** Displays average rating score across different users.
* **Update:** Edit existing rating score
* **Delete:** Remove ratings (future implementation)
* **Bridge Table:** Uses composite keys `(code, seller_id, user_id)` for referential integrity

### 5. Admin Panel
* **Read-Only Access:** Database inspection tool showing raw table data
* **Tables View:** Toggle between USER, PRODUCT, IMAGE, INFO, RATING tables
* **Column Metadata:** Displays data types, primary keys (🔑), foreign keys (🔗)
* **Purpose:** Verify composite key implementation and data integrity without synthetic ID abstraction

### 6. Image & Info Management
* **Create:** Automatically inserted when creating/updating products
* **Read:** Displayed on product detail pages (carousel for images)
* **Update:** Modified through product update operations
* **Delete:** Cascade deleted when parent product is removed
* **Bridge Tables:** Both use composite foreign keys `(code, seller_id)` referencing `PRODUCT`

***

## 5. Setup and Execution Guide

### Prerequisites

1. **Docker Desktop:** Must be installed and running
   * Download: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   * Verify installation by running `docker --version` in PowerShell
   * Ensure Docker Desktop is running before executing any commands

2. **System Requirements:**
   * Ports 3306 (MySQL), 5000 (Backend), 5173 (Frontend) must be available
   * Minimum 4GB RAM recommended for Docker containers

### Application Launch

#### 1. **Ensure Docker Desktop is running**

#### 2. **Setup (First Time Only)** - `setup.bat`

**Double-click:** `setup.bat` in the project root folder
* Performs full project initialization: installs dependencies, builds Docker images, creates Docker volumes, and sets up the database with schema and sample data
* **Run this only once** when first cloning the project
* Terminal closes automatically after successful completion

#### 3. **Start the Application** - `run.bat`

**Double-click:** `run.bat`
* Starts all Docker containers in detached mode
* Automatically opens the website 
* Displays logs from frontend, backend, and MySQL services
* Press `Ctrl+C` to stop viewing logs (containers continue running in background)

**Access the application:**
* **Frontend:** [http://localhost:5173](http://localhost:5173) - Main user interface
* **Backend API:** [http://localhost:5000](http://localhost:5000) - RESTful API endpoints
* **MySQL:** Port 3306 (accessible via MySQL Workbench or CLI)

#### 4. **Stop the Application** - `stop.bat`

**Double-click:** `stop.bat`
* Gracefully stops all running Docker containers
* Preserves database data (volumes are retained)

#### 4. **Reset Database** - `reset.bat`

**Double-click:** `reset.bat`
* Stops and removes all containers
* Deletes Docker volumes (⚠️ **ALL DATABASE DATA WILL BE LOST**)
* Rebuilds containers from scratch
* Reinitializes database with fresh sample data
* Use when you need a clean slate or database becomes corrupted

### Sample User Accounts

After running `setup.bat` or `reset.bat`, the following test accounts are available:

**Admin Account:**
* Email: `admin@email.com`
* Password: `admin1`
* Access: Admin panel, all features

**Seller Accounts:**
* Golden Hive: `goldenhive@email.com` / `123456`
* Sweet Nectar: `sweetnectar@email.com` / `123456`
* Buzzing Artisans: `buzzingartisans@email.com` / `123456`
* Access: Product management, seller dashboard, create ratings

**Buyer Account:**
* Email: `buyer@email.com`
* Password: `123456`
* Access: Browse products, create ratings