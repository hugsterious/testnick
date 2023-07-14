Install the dependent components:
npm install

Set up environment variables:
Create an .env file in the project directory.
Add the following environment variables to this file:
PORT
MONGODB_URI
JWT_SECRET.

Start the server:
npm start
or
npm run dev

The API provides the following endpoints:

POST /api/auth/register: Register a new user. Required fields: username, password, role.
POST /api/auth/login: User login. Required fields: username, password.
GET /api/users: Retrieve a list of users. Authentication required. Returns all users if the authenticated user is an administrator, otherwise returns the authenticated user and its subordinate users (if the user is a manager).
PUT /api/users/:userId/manager: Update user manager. Requires authentication and appropriate permissions based on user roles. Requires the managerId field in the body of the request.
