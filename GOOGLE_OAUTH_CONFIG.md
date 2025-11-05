# Google OAuth Configuration

## Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```env
# Google OAuth Configuration
WEB_CLIENT_IDS=360372745274-e4sij1mji6aacc13spu56t0t2unaqojs.apps.googleusercontent.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# Database Configuration
DATABASE_URL=your_mongodb_connection_string_here

# Email Configuration (for password reset and email verification)
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password_here

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# Social Media Links (for email templates)
facebookLink=https://facebook.com/yourpage
instegram=https://instagram.com/yourpage
twitterLink=https://twitter.com/yourpage
```

## API Endpoints

### Google Signup
**POST** `/auth/signup-google`

```json
{
  "idToken": "google_id_token_from_frontend"
}
```

### Google Login
**POST** `/auth/login-google`

```json
{
  "idToken": "google_id_token_from_frontend"
}
```

## Frontend Integration

### HTML Example
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <div id="g_id_onload"
         data-client_id="360372745274-e4sij1mji6aacc13spu56t0t2unaqojs.apps.googleusercontent.com"
         data-callback="handleCredentialResponse">
    </div>
    <div class="g_id_signin" data-type="standard"></div>

    <script>
        function handleCredentialResponse(response) {
            // Send the idToken to your backend
            fetch('http://localhost:3000/auth/signup-google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken: response.credential
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response:', data);
                if (data.data?.accessToken) {
                    // Store tokens
                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);
                    alert('Google signup successful!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    </script>
</body>
</html>
```

### React Example
```jsx
import { GoogleLogin } from '@react-oauth/google';

function GoogleAuthButton() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:3000/auth/signup-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();
      
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        console.log('Google signup successful');
      }
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

## Testing

1. **Set up environment variables** with your Google Client ID
2. **Start your NestJS server**
3. **Test with Postman:**
   - POST to `http://localhost:3000/auth/signup-google`
   - Body: `{ "idToken": "your_google_id_token" }`

## Response Format

```json
{
  "message": "Google signup successful",
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "id": 123,
      "username": "John Doe",
      "email": "user@gmail.com"
    }
  }
}
```

## Security Features

- ✅ Google ID token verification
- ✅ Email verification check
- ✅ Provider validation (Google vs System)
- ✅ JWT token generation
- ✅ Auto-confirm email for Google users
- ✅ Secure user creation and login

## Error Handling

- `400 Bad Request`: Invalid Google ID token
- `409 Conflict`: Email exists with different provider
- `502 Bad Gateway`: Failed to create user account
- `409 Conflict`: User not found (for login)
- `409 Conflict`: User is not a Google account
