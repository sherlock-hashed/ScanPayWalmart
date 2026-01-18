# Google Authentication Setup

This document explains how Google authentication has been integrated into the ScanPay application.

## Features Added

1. **Google Sign-In Button**: Added to both login and register pages
2. **Firebase Authentication**: Integrated with existing Firebase configuration
3. **Profile Picture Support**: Users who sign in with Google will see their profile picture in the header
4. **Automatic Session Management**: Firebase handles authentication state persistence
5. **Staff Access Control**: Only `pensalwarranveer1@gmail.com` gets staff privileges

## Configuration

### Firebase Setup
The application uses Firebase Authentication with Google provider. The configuration is in `src/lib/firebase.ts`:

```typescript
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
```

### Authentication Context
Updated `src/context/AuthContext.tsx` to include:
- `loginWithGoogle()` method
- Firebase auth state listener
- Profile picture support in user interface

## Usage

### For Users
1. Click the "Continue with Google" button on login or register page
2. Select your Google account in the popup
3. Grant necessary permissions
4. You'll be automatically signed in and redirected
5. **Staff Access**: Only `pensalwarranveer1@gmail.com` will receive staff privileges and be redirected to the staff dashboard

### For Developers
The `useAuth` hook now provides:
```typescript
const { loginWithGoogle, user } = useAuth();

// Check if user has profile picture
if (user?.photoURL) {
  // User signed in with Google
}
```

## Security Notes

1. **Firebase Security Rules**: Ensure your Firebase project has proper security rules configured
2. **Domain Verification**: Add your domain to Firebase Authentication authorized domains
3. **API Keys**: The current Firebase config is for development. Use environment variables for production

## Troubleshooting

### Common Issues

1. **Popup Blocked**: Users need to allow popups for the site
2. **Domain Not Authorized**: Add your domain to Firebase Authentication settings
3. **CORS Issues**: Ensure Firebase project settings include your domain

### Error Handling
The application includes error handling for:
- Popup closed by user
- Popup blocked by browser
- Network errors
- Authentication failures

## Next Steps

1. **Production Configuration**: Move Firebase config to environment variables
2. **Role Management**: Implement role assignment for Google users
3. **Profile Management**: Add ability to update profile information
4. **Additional Providers**: Consider adding other OAuth providers