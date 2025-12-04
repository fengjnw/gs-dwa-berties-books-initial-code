# Berties Books

Sample code for Dynamic Web Applications module using Node.js, Express, and EJS.

## Installation and Setup

```bash
# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env

# Edit .env to set your database credentials, session secret, and base path if needed

# Set up the database (create user and grant permissions first in MySQL)
mysql -u root -p < create_db.sql
mysql -u root -p < insert_test_data.sql

# Then run the app
node index.js
```

## Project Structure (tracked in Git)
```
.
├── .env.example
├── .gitignore
├── README.MD
├── create_db.sql
├── create_db-credentials.sql
├── insert_test_data.sql
├── index.js
├── links.txt
├── middleware/
│   ├── auth.js
│   └── validation.js
├── package-lock.json
├── package.json
├── public/
│   └── main.css
├── routes/
│   ├── api.js
│   ├── books.js
│   ├── main.js
│   └── users.js
├── tasks.md
└── views/
    ├── about.ejs
    ├── addbook.ejs
    ├── bargainbooks.ejs
    ├── book_list.ejs
    ├── index.ejs
    ├── login.ejs
    ├── login_audit.ejs
    ├── login_success.ejs
    ├── message.ejs
    ├── partials/
    │   ├── footer.ejs
    │   └── header.ejs
    ├── register.ejs
    ├── search.ejs
    ├── search_result.ejs
    ├── user_list.ejs
    ├── validation_errors.ejs
    └── weather.ejs
```

## Routes

### Main (`routes/main.js`)
- `GET /` - Home page
- `GET /about` - About page
- `GET /weather` - Weather check page with city search

### API (`routes/api.js`)
- `GET /api/books` - RESTful API endpoint for books search and filtering

### Books (`routes/books.js`)
- `GET /books/list` - View all books
- `GET /books/addbook` - Add book form (requires login)
- `POST /books/bookadded` - Create new book (requires login)
- `GET /books/search` - Search form
- `GET /books/search_result` - Search results
- `GET /books/bargainbooks` - Books under £20
- `GET /books/delete/:id` - Delete a book (requires login)

### Users (`routes/users.js`)
- `GET /users/register` - Registration form (redirects if already logged in)
- `POST /users/registered` - Create new user (redirects if already logged in)
- `GET /users/login` - Login form (redirects if already logged in)
- `POST /users/loggedin` - Authenticate user (redirects if already logged in)
- `GET /users/logout` - Log out current user (requires login)
- `GET /users/list` - View all users (requires login)
- `GET /users/delete/:id` - Delete a user (requires login)
- `GET /users/audit` - View login attempts (requires login)
- `GET /users/audit/delete/:id` - Delete audit log entry (requires login)

## Features

### Weather Integration
- Access at `/weather`
- Real-time weather information using OpenWeatherMap API
- City-based weather search with comprehensive error handling
- Displays icon, weather conditions, temperature, and details
- Shows detailed metrics: pressure, humidity, wind speed and direction
- Dynamic temperature color coding:
  - Blue (< 0°C) - Freezing
  - Light blue (0-10°C) - Cold
  - Green (10-20°C) - Cool
  - Orange (20-30°C) - Warm
  - Red (≥ 30°C) - Hot
- Handle errors and display error messages on a page:
  - Network errors (caught in request callback)
  - Status code errors from API (e.g., city not found)
  - JSON parse errors (caught with try/catch)

### RESTful API
- Endpoint at `GET /api/books`
- Search and filter books with JSON response
- Query Parameters:
    - `search` - Search term for book name (optional, max 100 chars)
    - `min_price` - Minimum price filter (optional, float >= 0)
    - `max_price` - Maximum price filter (optional, float >= 0)
    - `sort` - Sort order: "name" (ascending) or "price" (descending) (optional)
- Example: `/api/books?search=br&min_price=10&max_price=50&sort=price`
- All parameters validated with `express-validator`
- Responds with JSON data with error handling:
    - Successful queries return status `200` and `{"success": true, "data": [...]}`
    - Invalid parameters return status `400` with `{"success": false, "errors": [...]}`
    - Logical errors (e.g., min_price > max_price) return status `400` with `{"success": false, "error": 'Minimum price cannot be greater than maximum price'}`
    - Database errors return status `500` with `{"success": false, "error": 'Database query failed'}`

### Routes Protection
- Book management (add, delete) - Prevent unauthorized inventory changes
- User management (list, delete) - Protect sensitive user data
- Audit logs (view, delete) - Maintain log integrity
- Logout - Prevent session manipulation

### Input Validation & Sanitization

**Strategy**
- Frontend: HTML5 validation (`required`, `type="email"`, `min`/`step`)
- Backend: `express-validator` for type checking, format validation, length limits
- Sanitization: `express-sanitizer` for user-visible text fields only
- Database**: Parameterized queries prevent SQL injection
- Passwords: Hashed with bcrypt (10 rounds)
- Error Handling: Validation failures return HTTP 400 with detailed error messages

**Validated Fields (with Backend Validation)**

Registration (`/users/registered`)
- `username` - Required, 1-20 characters, alphanumeric only
- `password` - Required, minimum 8 characters
- `first` (first name) - Required, non-empty
- `last` (last name) - Required, non-empty
- `email` - Required, valid email format (`.isEmail()`), max 50 characters

Login (`/users/loggedin`)
- `username` - Required, non-empty
- `password` - Required, non-empty

Add Book (`/books/bookadded`)
- `name` - Required, 1-50 characters
- `price` - Required, float >= 0

Search Books (`/books/search_result`)
- `search_text` - Required, max 100 characters
- `search_mode` - Required, must be "Exact Match" or "Partial Match" (whitelist)

Delete Operations
- `id` (book/user/audit) - Integer >= 1

**NOT Validated**
- GET requests with no parameters (list views, static pages) - No user input to validate
- Logout - No form data; only destroys session
- Already validated in database - IDs retrieved from database queries are trusted
- Session data (`userId`) - Already validated during login, stored server-side

**Sanitized Fields (XSS Protection)**
- Registration: `username`, `first_name`, `last_name`
- Login: `username`
- Add Book: `name`
- Search: `search_text`

**NOT Sanitized (validated differently)**
- Passwords (hashed immediately, never displayed)
- Emails (validated with `.isEmail()`, not rendered as HTML)
- Numbers (validated as float/int, parsed to number type)
- Enums (whitelist validation with `.isIn()`)
- IDs (validated as integers, used in parameterized queries)

### Authentication & Sessions
- Session-based authentication using `express-session`
- Custom `redirectLogin` middleware in `middleware/auth.js`
- Protected routes redirect to login with return URL
- Login status displayed in header across all pages
- Session timeout: 10 minutes (600000ms)
- SameSite cookies to mitigate CSRF

### Environment Variables
- Database credentials managed via `.env` file using `dotenv` package
- Example: `BB_HOST='localhost'`, `BB_USER='app_user'`, `BB_PASSWORD='app_2027'`
- Access via `process.env.VARIABLE_NAME`

### Login Audit Trail
- All login attempts logged to `login_attempts` table
- Tracks: timestamp, username, success/failure, IP address
- View audit logs at `/users/audit`
- Delete functionality for debugging

### Search Functionality
- Search books by title
- Two modes: exact match or partial match
- Results displayed with book details

### Delete Functionality
- Books, users, and audit logs can be deleted
- Uses POST method (not GET) to prevent accidental deletions
- Implemented for debugging purposes only
- Requires authentication
- Confirmation prompt before deletion