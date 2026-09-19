// backend/config/allowedUsers.js

const ALLOWED_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@academy.com',
    password: 'adminpassword123',
    role: 'admin',
  },
  {
    id: '2',
    name: 'User',
    email: 'student@academy.com',
    password: 'studentpassword123',
    role: 'user',
  },
]

module.exports = ALLOWED_USERS
