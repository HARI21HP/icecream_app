# Admin Panel Setup Guide

## 🔐 Setting Up Admin Access

Your ice cream app now has **secure admin-only access** for managing products. Only the shop owner can access the Admin Panel.

---

## Step 1: Set Your Admin Email

Open `app/screens/admin.jsx` and `app/screens/profile.jsx`, then change the admin email:

```javascript
// Change this line in BOTH files:
const ADMIN_EMAIL = 'admin@icecream.com'; // Replace with YOUR email
```

**Example:**
```javascript
const ADMIN_EMAIL = 'yourshop@gmail.com'; // Use your actual email
```

---

## Step 2: Register Admin Account

1. **Open your app** (press `w` in Expo terminal for web)
2. **Go to Profile** → Click "Login / Sign Up"
3. **Register** with the SAME email you set above
4. **Complete registration**

---

## Step 3: Access Admin Panel

Once logged in with your admin email:

1. Go to **Profile** tab
2. You'll see **"Admin Panel"** option at the top
3. Click it to access admin features

**Non-admin users won't see this option!** ✅

---

## 🛠️ Admin Features

### Seed Products
- Click **"Seed Database"** to add 12 ice cream products
- Products will appear in the Shop immediately

### Manage Products (Coming Soon)
Future features will include:
- Mark items as "Out of Stock"
- Edit product prices
- Add new products
- Upload product images
- Delete products

---

## 🔒 Security

### Who Can Access Admin Panel?

✅ **Only users with:**
- Email matching `ADMIN_EMAIL` constant
- OR Firestore user document with `role: 'admin'`

❌ **All other users:**
- Won't see Admin Panel button
- Get "Access Denied" if they navigate directly

### Manual Role Assignment (Optional)

To give admin access to additional users via Firestore:

1. Go to Firebase Console → Firestore
2. Open the `users` collection
3. Find the user document (by UID)
4. Add field: `role` = `admin`

---

## 📝 Quick Reference

| File | Purpose |
|------|---------|
| `app/screens/admin.jsx` | Admin panel screen with authentication check |
| `app/screens/profile.jsx` | Shows/hides Admin Panel button based on role |
| `app/scripts/seedProducts.js` | Adds sample products to Firestore |

---

## 🚀 Next Steps

1. Change `ADMIN_EMAIL` in both files
2. Register with that email
3. Login and access Admin Panel
4. Seed your products
5. Start selling ice cream! 🍦

---

**Need help?** Check the console logs for authentication errors.
