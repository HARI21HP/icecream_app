// Storage Service - File upload and management operations
import { storage } from "../config/firebaseConfig";
import { ref, uploadBytes, uploadString, getDownloadURL, deleteObject, listAll, uploadBytesResumable } from "firebase/storage";
// Use legacy API for readAsStringAsync base64 fallback on Expo SDK 54
import * as FileSystem from "expo-file-system/legacy";

// Safe base64 encoding constant for Expo native and web shims
const BASE64_ENCODING = (FileSystem && FileSystem.EncodingType && FileSystem.EncodingType.Base64) ? FileSystem.EncodingType.Base64 : 'base64';

// ==================== PRODUCT IMAGES ====================

/**
 * Upload a product image to Firebase Storage
 * @param {string} fileUri - Local file URI or blob URL
 * @param {string} filename - Name for the file (should be unique)
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadProductImage = async (fileUri, filename) => {
  try {
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch file for upload (status ${response.status})`);
    }
    const blob = await response.blob();

    const storageRef = ref(storage, `products/${filename}`);
    const metadata = { contentType: blob.type || 'image/jpeg', cacheControl: 'public, max-age=31536000' };
    try {
      await uploadBytes(storageRef, blob, metadata);
    } catch (err) {
      // Fallback: base64 upload using data_url (more compatible on RN)
      const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: BASE64_ENCODING });
      const dataUrl = `data:${metadata.contentType || 'image/jpeg'};base64,${base64}`;
      await uploadString(storageRef, dataUrl, 'data_url');
    }

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("❌ Error uploading product image:", error);
    throw error;
  }
};

/**
 * Delete a product image from Firebase Storage
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<void>}
 */
export const deleteProductImage = async (filename) => {
  try {
    const storageRef = ref(storage, `products/${filename}`);
    await deleteObject(storageRef);

  } catch (error) {
    console.error("❌ Error deleting product image:", error);
    throw error;
  }
};

/**
 * List all product images
 * @returns {Promise<Array>} Array of image references
 */
export const listProductImages = async () => {
  try {
    const storageRef = ref(storage, "products/");
    const result = await listAll(storageRef);
    
    const images = await Promise.all(
      result.items.map(async (itemRef) => ({
        name: itemRef.name,
        fullPath: itemRef.fullPath,
        url: await getDownloadURL(itemRef),
      }))
    );

    return images;
  } catch (error) {
    console.error("❌ Error listing product images:", error);
    throw error;
  }
};

// ==================== PROFILE PICTURES ====================

/**
 * Upload a user profile picture to Firebase Storage
 * @param {string} userId - User UID
 * @param {string} fileUri - Local file URI or blob URL
 * @returns {Promise<string>} Download URL of uploaded profile picture
 */
export const uploadProfilePicture = async (userId, fileUri) => {
  try {
    // Use folder + filename to avoid overwriting
    const filename = `profile_${Date.now()}.jpg`;
    const storageRef = ref(storage, `profile_pictures/${userId}/${filename}`);
    const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: BASE64_ENCODING });
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    await uploadString(storageRef, dataUrl, 'data_url');

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("❌ Error uploading profile picture:", error);
    throw error;
  }
};

/**
 * Delete a user's profile picture from Firebase Storage
 * @param {string} userId - User UID
 * @returns {Promise<void>}
 */
export const deleteProfilePicture = async (userId) => {
  try {
    const storageRef = ref(storage, `profile_pictures/${userId}`);
    await deleteObject(storageRef);

  } catch (error) {
    console.error("❌ Error deleting profile picture:", error);
    throw error;
  }
};

/**
 * Get profile picture URL for a user
 * @param {string} userId - User UID
 * @returns {Promise<string|null>} Download URL or null if not found
 */
export const getProfilePictureURL = async (userId) => {
  try {
    const storageRef = ref(storage, `profile_pictures/${userId}`);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    if (error.code === "storage/object-not-found") {

      return null;
    }
    console.error("❌ Error getting profile picture URL:", error);
    throw error;
  }
};

// ==================== GENERAL UPLOAD ====================

/**
 * Upload a file to a custom path in Firebase Storage
 * @param {string} fileUri - Local file URI or blob URL
 * @param {string} path - Storage path (e.g., 'orders/receipt_123.pdf')
 * @param {Object} metadata - Optional file metadata
 * @returns {Promise<string>} Download URL of uploaded file
 */
export const uploadFile = async (fileUri, path, metadata = {}) => {
  try {

    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, path);
    try {
      await uploadBytes(storageRef, blob, metadata);
    } catch (err) {
      // Ensure contentType for generic uploads
      const ensuredMeta = { contentType: blob.type || metadata?.contentType || 'application/octet-stream', ...metadata };
      const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: BASE64_ENCODING });
      const dataUrl = `data:${ensuredMeta.contentType};base64,${base64}`;
      await uploadString(storageRef, dataUrl, 'data_url');
    }
    
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error(`❌ Error uploading file to ${path}:`, error);
    throw error;
  }
};

/**
 * Upload a file with progress updates using uploadBytesResumable
 * @param {string} fileUri - Local file URI
 * @param {string} path - Storage path (e.g., 'products/{productId}/image.jpg')
 * @param {(progress:number)=>void} onProgress - Callback with [0..1]
 * @param {Object} metadata - Optional metadata with contentType
 * @returns {Promise<string>} Download URL
 */
export const uploadFileWithProgress = async (fileUri, path, onProgress = () => {}, metadata = {}) => {
  const response = await fetch(fileUri);
  if (!response.ok) throw new Error(`Failed to fetch file for upload (status ${response.status})`);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  const ensuredMeta = { contentType: blob.type || metadata?.contentType || 'application/octet-stream', ...metadata };

  try {
    const task = uploadBytesResumable(storageRef, blob, ensuredMeta);
    return await new Promise((resolve, reject) => {
      task.on('state_changed', (snapshot) => {
        if (snapshot.totalBytes > 0) {
          onProgress(snapshot.bytesTransferred / snapshot.totalBytes);
        }
      }, (error) => {
        reject(error);
      }, async () => {
        const url = await getDownloadURL(storageRef);
        resolve(url);
      });
    });
  } catch (err) {
    // Fallback to base64 (no progress events) using data_url
    const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: BASE64_ENCODING });
    const dataUrl = `data:${ensuredMeta.contentType};base64,${base64}`;
    await uploadString(storageRef, dataUrl, 'data_url');
    const url = await getDownloadURL(storageRef);
    onProgress(1);
    return url;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} path - Storage path of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);

  } catch (error) {
    console.error(`❌ Error deleting file ${path}:`, error);
    throw error;
  }
};

/**
 * Get download URL for a file
 * @param {string} path - Storage path
 * @returns {Promise<string|null>} Download URL or null if not found
 */
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    if (error.code === "storage/object-not-found") {

      return null;
    }
    console.error(`❌ Error getting file URL for ${path}:`, error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a unique filename with timestamp
 * @param {string} originalName - Original filename
 * @param {string} userId - Optional user ID to include
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (originalName, userId = null) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const extension = originalName.split(".").pop();
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  
  if (userId) {
    return `${userId}_${baseName}_${timestamp}_${randomStr}.${extension}`;
  }
  
  return `${baseName}_${timestamp}_${randomStr}.${extension}`;
};

/**
 * Get file extension from URI
 * @param {string} uri - File URI
 * @returns {string} File extension
 */
export const getFileExtension = (uri) => {
  return uri.split(".").pop().split("?")[0];
};

/**
 * Validate image file type
 * @param {string} uri - File URI
 * @returns {boolean} True if valid image type
 */
export const isValidImageType = (uri) => {
  const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const extension = getFileExtension(uri).toLowerCase();
  return validExtensions.includes(extension);
};

/**
 * Compress image before upload (web only)
 * @param {string} uri - Image URI
 * @param {number} maxWidth - Max width in pixels
 * @param {number} quality - Quality 0-1
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = async (uri, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas to Blob conversion failed"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
    img.src = uri;
  });
};

// ==================== EXPORTS ====================

export default {
  // Product images
  uploadProductImage,
  deleteProductImage,
  listProductImages,
  
  // Profile pictures
  uploadProfilePicture,
  deleteProfilePicture,
  getProfilePictureURL,
  
  // General file operations
  uploadFile,
  deleteFile,
  getFileURL,
  
  // Helpers
  generateUniqueFilename,
  getFileExtension,
  isValidImageType,
  compressImage,
};
