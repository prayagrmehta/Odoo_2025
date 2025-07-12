# Skill Swap Backend

A Django REST API backend for the Skill Swap Platform. This backend provides authentication, user management, skills management, and swap request functionality.

## Features

- **Authentication**: JWT-based authentication with email/password
- **User Management**: User registration, profile management, photo upload
- **Skills Management**: Create and manage skills
- **Swap Requests**: Create, accept, reject, and list swap requests
- **CORS Support**: Configured for React frontend
- **Admin Interface**: Django admin for data management

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

4. **Run the server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication

- `POST /api/token/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh JWT token
- `POST /api/users/register/` - Register new user

### Users

- `GET /api/users/profile/` - Get current user profile
- `PUT /api/users/profile/` - Update user profile
- `GET /api/users/list/` - Get list of public users (for browse)

### Skills

- `GET /api/skills/` - Get all skills
- `POST /api/skills/` - Create new skill

### Swap Requests

- `GET /api/swaps/` - Get user's swap requests (sent and received)
- `POST /api/swaps/` - Create new swap request
- `PATCH /api/swaps/{id}/` - Update swap request status (accept/reject)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Request/Response Examples

### Register User
```bash
POST /api/users/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirm": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login
```bash
POST /api/token/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

### Create Swap Request
```bash
POST /api/swaps/
Authorization: Bearer <token>
Content-Type: application/json

{
  "to_user_id": 2,
  "skills_offered": [1, 2],
  "skills_wanted": [3, 4],
  "message": "I can help you with React and JavaScript!"
}
```

### Accept Swap Request
```bash
PATCH /api/swaps/1/
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

## Models

### User
- Extends Django's AbstractUser
- Additional fields: photo, bio, location, is_public, rating, skills_offered, skills_wanted, availability

### Skill
- name: CharField (unique)
- created_at, updated_at: DateTimeField

### SwapRequest
- from_user, to_user: ForeignKey to User
- skills_offered, skills_wanted: ManyToManyField to Skill
- message: TextField
- status: CharField (pending, accepted, rejected)
- created_at, updated_at: DateTimeField

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` to manage:
- Users and their profiles
- Skills
- Swap requests

## Development

### Adding New Endpoints

1. Create views in the appropriate app
2. Add serializers if needed
3. Update URLs
4. Test with the frontend

### Database Changes

1. Update models
2. Create migrations: `python manage.py makemigrations`
3. Apply migrations: `python manage.py migrate`

## Production Deployment

For production deployment:

1. Set `DEBUG = False` in settings.py
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure CORS for production domains
5. Use environment variables for sensitive settings
6. Set up proper JWT settings

## Frontend Integration

The frontend should:
1. Store JWT tokens in localStorage
2. Include tokens in Authorization header for protected requests
3. Handle token refresh when needed
4. Use the API endpoints defined above

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure CORS settings are correct for your frontend domain
2. **Authentication errors**: Check JWT token format and expiration
3. **File upload issues**: Ensure proper form data handling for photo uploads

### Debug Mode

Set `DEBUG = True` in settings.py for detailed error messages during development. 