# Berties Books

Sample code for Dynamic Web Applications module using Node.js, Express, and EJS.

## Installation and Setup

```bash
# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env

# Edit .env and set your database credentials and session secret

# Set up the database (create user and grant permissions first in MySQL)
mysql -u root -p < create_db.sql
mysql -u root -p < insert_test_data.sql

# Then run the app
node index.js
```

## Project Structure
```
.
├── create_db.sql           # Database schema
├── insert_test_data.sql    # Sample data
├── setup_db.js             # Database initialization script
├── index.js                # Express app entry point
├── package.json
├── .env                    # Environment variables (not in repo)
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Validation error handling
├── public/
│   └── main.css            # Site-wide styling
├── routes/
│   ├── main.js             # Root + about pages
│   ├── books.js            # Book CRUD/search routes
│   └── users.js            # User registration, login, audit routes
└── views/
    ├── partials/
    │   ├── header.ejs      # Shared header with login status
    │   └── footer.ejs      # Shared footer with navigation
    ├── index.ejs
    ├── about.ejs
    ├── register.ejs
    ├── login.ejs
    ├── user_list.ejs
    ├── addbook.ejs
    ├── book_list.ejs
    ├── bargainbooks.ejs
    ├── search.ejs
    ├── search_result.ejs
    ├── login_audit.ejs
    ├── message.ejs         # Generic message template
    └── validation_errors.ejs
```

## Routes

### Main (`routes/main.js`)
- `GET /` - Home page
- `GET /about` - About page

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

### Routes Protection
- Book management (add, delete) - Prevent unauthorized inventory changes
- User management (list, delete) - Protect sensitive user data
- Audit logs (view, delete) - Maintain log integrity
- Logout - Prevent session manipulation

### Input Validation & Sanitization

**Strategy:**
- Frontend: HTML5 validation (`required`, `type="email"`, `min`/`step`)
- Backend: `express-validator` for type checking, format validation, length limits
- Sanitization: `express-sanitizer` for user-visible text fields only
- Database**: Parameterized queries prevent SQL injection
- Passwords: Hashed with bcrypt (10 rounds)
- Error Handling: Validation failures return HTTP 400 with detailed error messages

**Validated Fields (with Backend Validation):**

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

*Delete Operations*
- `id` (book/user/audit) - Integer >= 1

**NOT Validated:**
- GET requests with no parameters (list views, static pages) - No user input to validate
- Logout - No form data; only destroys session
- Already validated in databas* - IDs retrieved from database queries are trusted
- Session data (`userId`) - Already validated during login, stored server-side

**Sanitized Fields (XSS Protection):**
- Registration: `username`, `first_name`, `last_name`
- Login: `username`
- Add Book: `name`
- Search: `search_text`

**NOT Sanitized (validated differently):**
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
- Example: `BB_HOST='localhost'`, `BB_USER='appuser'`, `BB_PASSWORD='app2027'`
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