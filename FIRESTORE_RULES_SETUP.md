# Firestore Security Rules Setup Guide

If you're getting "permission-denied" errors when saving addresses, you need to set up Firestore security rules.

## Steps to Fix:

### 1. Go to Firebase Console
- Open: https://console.firebase.google.com/project/vee-one-33b07/firestore/rules
- Or navigate to: **Firestore Database → Rules**

### 2. Replace the rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Products collection - public read, authenticated write
    match /products/{productId} {
      allow read: if true;  // Anyone can read products
      allow write: if isSignedIn();  // Only authenticated users can write
    }
    
    // Users collection
    match /users/{userId} {
      // User can read/write their own document
      allow read, write: if isOwner(userId);
      
      // Addresses subcollection
      match /addresses/{addressId} {
        allow read, write: if isOwner(userId);
      }
      
      // Orders subcollection
      match /orders/{orderId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Orders collection (top-level for admin access)
    match /orders/{orderId} {
      allow read: if isSignedIn() && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.email == 'hariprakashpc@gmail.com');
      allow write: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Click "Publish" button

### 4. Test the App
- Make sure you're logged in
- Try adding an address again
- It should work now!

## Common Errors and Solutions:

### Error: "Missing or insufficient permissions"
**Solution:** You need to publish the Firestore rules above

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"
**Solution:** Make sure you're logged in with Email/Password authentication

### Error: "User collection not found"
**Solution:** The user document will be created automatically when you first save data

## Security Rules Explanation:

- **Products**: Everyone can read, only logged-in users can create/update
- **User addresses**: Only the owner can access their addresses
- **User orders**: Only the owner can access their orders
- **Top-level orders**: Accessible by owner or admin email

## Enable Email/Password Authentication:

If you haven't enabled authentication:
1. Go to: https://console.firebase.google.com/project/vee-one-33b07/authentication/providers
2. Click **Email/Password**
3. Toggle **Enable**
4. Click **Save**

## Need Help?

Check the Firebase console for detailed error messages:
- **Firestore → Data** - View your collections
- **Firestore → Rules** - Edit security rules
- **Authentication → Users** - See registered users
