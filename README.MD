# Berties Books

Sample code for Dynamic Web Applications module using Node.js, Express, and EJS.

## Installation and Setup

```bash
npm install
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

**Validation Strategy:**
- Frontend: HTML5 validation (`required`, `type="email"`, `min`/`step`)
- Backend: `express-validator` for type checking, format validation, length limits
- Sanitization: `express-sanitizer` for user-visible text fields only
- Database: Parameterized queries prevent SQL injection
- Passwords: Hashed with bcrypt (10 rounds)

**Sanitized Fields (XSS Protection):**
- Registration: `username`, `first_name`, `last_name`
- Login: `username`
- Add Book: `name`
- Search: `search_text`

**NOT Sanitized (validated differently):**
- Passwords (hashed immediately)
- Emails (validated with `.isEmail()`)
- Numbers (validated as float/int, parsed)
- Enums (whitelist validation)

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