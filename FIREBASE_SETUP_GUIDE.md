# Firebase Setup Guide - VEE-ONE Ice Creams App

## Project Information
- **Project ID**: vee-one-7ec61
- **Project Number**: 144639120405
- **Package Name (Android)**: com.icecream.icecreamapp
- **Bundle ID (iOS)**: com.icecream.icecreamapp

---

## Step 1: Create a Web App in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/vee-one-7ec61/settings/general)
2. Navigate to **Project settings** → **General** → **Your apps**
3. Click the **Web icon** (`</>`) to add a new Web app
4. Enter app nickname: **VEE-ONE Web** (or any name)
5. ✅ Check "Also set up Firebase Hosting" if you plan to deploy (optional)
6. Click **Register app**
7. **Copy the Firebase configuration object**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyArHAvaY3IQflhNLY8ltkYgUX0JQQIxF8c",
  authDomain: "vee-one-7ec61.firebaseapp.com",
  projectId: "vee-one-7ec61",
  storageBucket: "vee-one-7ec61.appspot.com",
  messagingSenderId: "144639120405",
  appId: "1:144639120405:web:XXXXXXXXXXXXXX",  // ← Copy this exact value
  measurementId: "G-XXXXXXXXXX"  // ← Optional Analytics ID
};
```

8. **Save the `appId`** – you'll need it in Step 3.

---

## Step 2: Register Android App

1. In Firebase Console → **Project settings** → **General** → **Your apps**
2. Click **Add app** → **Android** icon
3. Enter the **Android package name**: `com.icecream.icecreamapp`
   - ⚠️ Must match exactly what's in your `app.json`
4. Enter app nickname: **VEE-ONE Android**
5. (Optional) Add SHA-1 certificate fingerprint for Google Sign-In later
6. Click **Register app**
7. **Download `google-services.json`**
8. Place the file at: `C:\Users\harip\OneDrive\Desktop\icecream_app\google-services.json`
   - ✅ Replace any old `google-services.json` with different package names

---

## Step 3: Update Firebase Config in Code

### Option A: Using Environment Variables (Recommended)

Open PowerShell in your project folder and set these before starting Expo:

```powershell
# Set Firebase environment variables
$env:EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSyArHAvaY3IQflhNLY8ltkYgUX0JQQIxF8c"
$env:EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="vee-one-7ec61.firebaseapp.com"
$env:EXPO_PUBLIC_FIREBASE_PROJECT_ID="vee-one-7ec61"
$env:EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="vee-one-7ec61.appspot.com"
$env:EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="144639120405"
$env:EXPO_PUBLIC_FIREBASE_APP_ID="1:144639120405:web:XXXXXXXXXXXXXX"  # ← Paste your real Web App ID from Step 1
$env:EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"  # ← Optional

# Start Expo
npx expo start
```

### Option B: Edit `app/config/firebase.js` Directly

Open `app/config/firebase.js` and replace the fallback config with your real Web App config from Step 1.

---

## Step 4: Enable Authentication

1. Go to [Firebase Console → Authentication](https://console.firebase.google.com/project/vee-one-7ec61/authentication)
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Enable **Email/Password**:
   - Click **Email/Password**
   - Toggle **Enable**
   - Click **Save**

### Set Authorized Domains (for Web)

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Ensure these are listed:
   - `localhost` ✅ (default)
   - Add your LAN IP if testing on mobile (e.g., `172.24.242.210`)

---

## Step 5: Create Firestore Database

1. Go to [Firebase Console → Firestore Database](https://console.firebase.google.com/project/vee-one-7ec61/firestore)
2. Click **Create database**
3. Choose **Production mode** (you'll set custom rules next)
4. Select a location (e.g., `us-central1` or closest to your users)
5. Click **Enable**

### Set Firestore Rules

1. Once created, go to **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products: anyone can read, only authenticated users can write (admin)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders: users can read/create their own orders only
    match /orders/{orderId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if false;
    }
    
    // Users: users can read/write their own profile data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Addresses subcollection
      match /addresses/{addressId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **Publish**

---

## Step 6: Enable Storage (for Profile Pictures)

1. Go to [Firebase Console → Storage](https://console.firebase.google.com/project/vee-one-7ec61/storage)
2. Click **Get started**
3. Choose **Production mode** (you'll set custom rules next)
4. Use the same location as Firestore
5. Click **Done**

### Set Storage Rules

1. Go to **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Profile pictures: only the user can read/write their own
    match /profilePictures/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public assets (optional)
    match /public/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

3. Click **Publish**

---

## Step 7: Verify Setup

### Start the Development Server

```powershell
# If using environment variables, set them first (see Step 3 Option A)
npx expo start
```

### Test on Web

1. Press `w` to open in browser
2. Use **Incognito/Private mode** to avoid browser extension conflicts
3. Open Developer Console (F12)
4. Check for errors:
   - ✅ No "Auth configuration not found"
   - ✅ No "Missing or insufficient permissions"
   - ✅ No "WebChannel transport errored"

### Test Authentication

1. Navigate to **Register** screen
2. Create a test account:
   - Email: `test@veeone.com`
   - Password: `test123`
3. Check Firestore → `users` collection for the new user document
4. Check Authentication → Users for the new user

### Seed Products

1. Navigate to **Profile** → **Admin Panel**
2. Click **Seed Database**
3. Confirm the action
4. Check Firestore → `products` collection for 12 ice cream products
5. Reload the app; products should now appear in the shop

---

## Step 8: Test on Android (Optional)

1. Connect Android device or start emulator
2. Run:
   ```powershell
   npx expo run:android
   ```
3. The `google-services.json` will be automatically included
4. Test login/register, product browsing, cart, checkout

---

## Common Issues & Fixes

### ❌ "Auth configuration not found"
- **Cause**: Web App not registered or wrong `appId`
- **Fix**: Complete Step 1, ensure `appId` is correct

### ❌ "Missing or insufficient permissions" (Firestore)
- **Cause**: Rules not published or too restrictive
- **Fix**: Publish rules from Step 5

### ❌ "Operation not allowed" (Auth)
- **Cause**: Email/Password sign-in not enabled
- **Fix**: Enable in Step 4

### ❌ "Unauthorized domain"
- **Cause**: Your domain/IP not in authorized list
- **Fix**: Add to authorized domains in Step 4

### ❌ AsyncStorage warning on Web
- **Cause**: Already fixed in code (using Platform.OS check)
- **Fix**: Restart Expo if you still see it

### ❌ WebChannel transport errors
- **Cause**: Network/proxy issues
- **Fix**: Already using long polling in code; try disabling browser extensions

---

## Environment Variables Reference

For permanent setup, create a `.env` file (don't commit it!) and use `app.config.js`:

**`.env`** (create in project root):
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyArHAvaY3IQflhNLY8ltkYgUX0JQQIxF8c
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=vee-one-7ec61.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=vee-one-7ec61
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=vee-one-7ec61.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=144639120405
EXPO_PUBLIC_FIREBASE_APP_ID=1:144639120405:web:XXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Add `.env` to `.gitignore`:
```
.env
```

---

## Next Steps

✅ Once Firebase is set up:
1. Test all flows: register, login, browse products, add to cart, checkout
2. Seed products via Admin Panel
3. Test address management
4. Test order creation and history
5. Deploy Firestore/Storage rules to production when ready

---

## Support

- Firebase Docs: https://firebase.google.com/docs
- Expo Docs: https://docs.expo.dev
- Project Console: https://console.firebase.google.com/project/vee-one-7ec61

---

**Last Updated**: October 26, 2025
