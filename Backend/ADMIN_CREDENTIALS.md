# Demo Admin Credentials

## Test Admin (no Supabase required)

Use these to log in without any Supabase user. Works as long as the backend is running.

**Email:** `test@admin.com`  
**Password:** `test123`

---

## Supabase Admin (full flow)

**Email:** `admin@demo.com`  
**Password:** `Admin123!@#`

Create this user in Supabase (see below) if you need real auth.

## How to Create the Admin User

You have two options to create this admin user:

### Option 1: Using Firebase Console (Recommended for Quick Testing)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `futureecommereapp`
3. Navigate to **Authentication** → **Users**
4. Click **Add User**
5. Enter:
   - Email: `admin@demo.com`
   - Password: `Admin123!@#`
   - Disable "Send email verification" (for testing)
6. Click **Add User**
7. Copy the **User UID** that was created

8. Navigate to **Firestore Database** → **Data**
9. Create a new document in the `users` collection with the User UID as the document ID
10. Add the following fields:
    ```json
    {
      "userId": "<paste-user-uid-here>",
      "email": "admin@demo.com",
      "firstName": "Demo",
      "lastName": "Admin",
      "displayName": "Demo Admin",
      "role": "admin",
      "accountStatus": "active",
      "emailVerified": true,
      "isGuest": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "preferences": {
        "language": "en",
        "currency": "USD",
        "notificationsEnabled": true,
        "emailNotifications": true,
        "smsNotifications": false,
        "pushNotifications": true,
        "newsletter": false,
        "theme": "light"
      }
    }
    ```

### Option 2: Using the Script (Requires Firebase Admin SDK Setup)

1. Set up Firebase Admin SDK credentials in `Backend/.env`:
   ```env
   FIREBASE_PROJECT_ID=futureecommereapp
   FIREBASE_CLIENT_EMAIL=your-service-account-email@futureecommereapp.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

2. Run the script:
   ```bash
   cd Backend
   node scripts/createAdminUser.js
   ```

## After Creating the User

1. Go to the admin panel: http://localhost:5173/login
2. Login with:
   - Email: `admin@demo.com`
   - Password: `Admin123!@#`

## Security Note

⚠️ **Important:** These are demo credentials. Change the password and use proper security practices in production!

