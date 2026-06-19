# o2h Mini Project Management Portal

A full-stack, responsive web application for managing project tasks. It features JWT Authentication, Task Search, Status Filtering, Pagination, Created Date Sorting, Dashboard Statistics, a Dark Mode toggle, and API unit testing.

Developed as a hiring assessment project following modern clean-code practices.

---

## Folder Structure

```
project-root/
├─ backend/
│  ├─ config/       # DB configuration
│  ├─ controllers/  # Auth & Task business logic
│  ├─ middleware/   # Authentication guard middleware
│  ├─ models/       # User & Task schemas
│  ├─ routes/       # Auth & Task express endpoints
│  ├─ tests/        # Integration/Unit Jest tests
│  ├─ server.js     # Express app startup & configuration
│  └─ package.json  # Node.js configurations & dependencies
├─ frontend/
│  ├─ src/
│  │  ├─ components/ # Header navigation, stats panel
│  │  ├─ pages/      # Login, Register, Dashboard, AddTask pages
│  │  ├─ services/   # Axios API client connection services
│  │  ├─ App.jsx     # State controller & client router
│  │  ├─ index.css   # Custom premium design system & styles
│  │  └─ main.jsx    # DOM mounting entry
│  ├─ index.html
│  └─ package.json
└─ README.md        # Documentation
```

---

## System Requirements

- **Node.js**: `v18.x.x` or above (verified with `v22.20.0`)
- **npm**: `v9.x.x` or above (verified with `v10.9.3`)
- **Database**: MongoDB (local instance running on port `27017` or a MongoDB Atlas URI)

---

## Local Setup & Installation

### 1. Database Setup
Make sure MongoDB is running locally on your computer:
```bash
# Default connection string
mongodb://127.0.0.1:27017/o2h-task-portal
```

### 2. Clone the Repository
```bash
git clone <repository_url>
cd o2h-Mini-Project
```

### 3. Backend Setup
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. A `.env` file has already been created for you with default configurations. If you need to edit the port or database URI, you can modify it:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/o2h-task-portal
   JWT_SECRET=super_secret_o2h_hiring_token_key_98765
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will run on [http://localhost:5000](http://localhost:5000)*

### 4. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client application will run on [http://localhost:5173](http://localhost:5173)*

---

## Running Unit & Integration Tests

We use Jest and Supertest to validate the authentication and task APIs. To run tests:
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Run the test command:
   ```bash
   npm run test
   ```
   *Note: Tests will run against a temporary test database (`mongodb://127.0.0.1:27017/o2h-task-portal-test`) and clean up collections after running.*

---

## Assumptions Made

1. **User Ownership of Tasks**: Tasks are private and protected. A registered user can only see, filter, update, and delete tasks that *they* created.
2. **MongoDB Connection**: It is assumed that a local MongoDB database is accessible on port `27017` without username/password authentication (standard default install). If credentials or custom hosts are required, it can be adjusted in the backend `.env` file.
3. **Token Lifetime**: JWT tokens are configured to expire in 30 days to facilitate testing without needing frequent logins.
4. **Description Length**: Client and server validation enforces a minimum of 20 characters for a task description to ensure detailed requirements are entered.

---

## API Documentation

All request bodies are in JSON format. For protected routes, pass the authorization token in the request header as: `Authorization: Bearer <your_jwt_token>`

### Authentication Endpoints

#### 1. Register User
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "username": "rohit",
    "email": "rohit@example.com",
    "password": "password123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64fbcfc8f...",
      "username": "rohit",
      "email": "rohit@example.com",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

#### 2. User Login
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "rohit@example.com",
    "password": "password123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64fbcfc8f...",
      "username": "rohit",
      "email": "rohit@example.com",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

#### 3. Get Current User Profile
* **Endpoint**: `GET /api/auth/me`
* **Access**: Protected (JWT token required)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64fbcfc8f...",
      "username": "rohit",
      "email": "rohit@example.com",
      "created_at": "2026-06-19T22:50:35.000Z"
    }
  }
  ```

---

### Task Endpoints

#### 1. Get Tasks (Search, Filter, Sort, Paginate)
* **Endpoint**: `GET /api/tasks`
* **Access**: Protected
* **Query Parameters** (all optional):
  * `status`: Filter by status (`Pending`, `In Progress`, `Completed`, or `All`)
  * `q`: Search keyword inside title or description
  * `sortBy`: Field to sort (`created_at` or `title`)
  * `sortOrder`: Direction of sort (`asc` or `desc`)
  * `page`: Page number (default: `1`)
  * `limit`: Items per page (default: `5`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "64fbd21df...",
        "title": "Build Login Page",
        "description": "Create a responsive login page using HTML, CSS, and validation scripts",
        "status": "Pending",
        "user": "64fbcfc8f...",
        "created_at": "2026-06-19T22:50:35.000Z"
      }
    ],
    "pagination": {
      "totalTasks": 1,
      "totalPages": 1,
      "currentPage": 1,
      "limit": 5
    }
  }
  ```

#### 2. Get Task Stats
* **Endpoint**: `GET /api/tasks/stats`
* **Access**: Protected
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "total": 5,
      "pending": 2,
      "inProgress": 1,
      "completed": 2
    }
  }
  ```

#### 3. Create Task
* **Endpoint**: `POST /api/tasks`
* **Access**: Protected
* **Request Body**:
  ```json
  {
    "title": "Build Login Page",
    "description": "Create a responsive login page using HTML, CSS, and validation scripts",
    "status": "Pending"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64fbd21df...",
      "title": "Build Login Page",
      "description": "Create a responsive login page using HTML, CSS, and validation scripts",
      "status": "Pending",
      "user": "64fbcfc8f...",
      "created_at": "2026-06-19T22:50:35.000Z"
    }
  }
  ```

#### 4. Update Task Status
* **Endpoint**: `PUT /api/tasks/:id`
* **Access**: Protected
* **Request Body**:
  ```json
  {
    "status": "Completed"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64fbd21df...",
      "title": "Build Login Page",
      "status": "Completed"
    }
  }
  ```

#### 5. Delete Task
* **Endpoint**: `DELETE /api/tasks/:id`
* **Access**: Protected
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```
