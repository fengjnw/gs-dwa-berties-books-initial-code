
# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install

node index.js

---

## Extensions

### Dotenv
- Use `dotenv` package to manage environment variables for database connection details. For example:
```
BB_HOST='localhost'
```
- Variables are stored in a `.env` file and loaded at runtime by `process.env.VARIABLE_NAME`. For example:
```
host: process.env.BB_HOST
```

### Audit
- Login attempts (successful and failed) are logged into a `login_attempts` table with timestamp, username, success flag, and IP address.
- Insertion happens in the `/users/loggedin` route after login is attempted.
- The audit page displays these attempts in a table format.
- Use ejs to transform data like timestamps and success flags for better readability.

### Delete functionality
- Both books, users, and login attempts can be deleted via links in their respective lists, using the `:id` parameter.
- After deletion, the user is redirected back to the list page to see the updated list.
- Implemented in the `/books/delete/:id`, `/users/delete/:id`, and `/users/audit/delete/:id` routes.
- This function is only for debug management and should not be present in a production system without proper access control.

### Validation
- Basic HTML5 validation is added to forms (e.g., `required` attributes, input types, `min` and `step` for price).
- Input validation statements are included in routes handlers.
- Empty search queries are handled by displaying a message.

### Back buttons
- Added back buttons to relevant pages for better navigation.

### Searching
- Users can search for books by title, with options for exact or partial matches.

---

## Project structure
```
.
├── create_db.sql
├── insert_test_data.sql
├── index.js                # Express bootstrap + router wiring
├── package.json / package-lock.json
├── public/
│   └── main.css            # Site-wide styling
├── routes/
│   ├── main.js             # root + about pages
│   ├── books.js            # book catalog CRUD/search routes
│   └── users.js            # registration, login, audit routes
├── views/
│   ├── about.ejs
│   ├── addbook.ejs
│   ├── bargainbooks.ejs
│   ├── book_list.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── login_audit.ejs
│   ├── register.ejs
│   ├── search.ejs
│   ├── search_result.ejs
│   └── user_list.ejs
└── README.MD
```

---

## Routes

**Main router (`routes/main.js`)**
- `GET /` → renders `index.ejs`
- `GET /about` → renders `about.ejs`

**Books router (`routes/books.js`)**
- `GET /books/list` → render `book_list.ejs` with all books
- `GET /books/addbook` → render `addbook.ejs`
- `POST /books/bookadded` → insert a new book, respond with confirmation
- `GET /books/search` → render search form (`search.ejs`)
- `GET /books/search_result` → run search (exact/partial) and render `search_result.ejs`
- `GET /books/bargainbooks` → render `bargainbooks.ejs` for books under £20
- `GET /books/delete/:id` → delete a book then redirect back to the list

**Users router (`routes/users.js`)**
- `GET /users/register` → render `register.ejs`
- `POST /users/registered` → create a user (hash password, store, confirm)
- `GET /users/list` → render `user_list.ejs` with all users
- `GET /users/delete/:id` → delete a user then redirect back to the list
- `GET /users/login` → render `login.ejs`
- `POST /users/loggedin` → authenticate user; logs success/failure into `login_attempts`
- `GET /users/audit` → render `login_audit.ejs` showing recent login attempts