import crypto from "crypto";

// Encryption key should be stored in environment variables
// For production, use a strong 32-byte key stored securely
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

// Ensure key is exactly 32 bytes for AES-256
const KEY = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex");

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param {string|number} text - The text to encrypt
 * @returns {string} Encrypted text in format: iv:encryptedData:authTag
 */
export const encrypt = (text) => {
  if (!text && text !== 0) return null;

  // Convert to string if it's a number
  const textToEncrypt = String(text);

  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);

  // Encrypt the text
  let encrypted = cipher.update(textToEncrypt, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  // Return iv:encryptedData:authTag (all in hex)
  return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
};

/**
 * Decrypts data encrypted with encrypt()
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData:authTag
 * @returns {string} Decrypted text
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;

  try {
    // Split the encrypted text
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], "hex");

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the text
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null;
  }
};

/**
 * Encrypts a number and returns it as encrypted string
 * @param {number} value - Number to encrypt
 * @returns {string} Encrypted value
 */
export const encryptNumber = (value) => {
  if (!value && value !== 0) return null;
  return encrypt(String(value));
};

/**
 * Decrypts a value and returns it as a number
 * @param {string} encryptedValue - Encrypted value
 * @returns {number} Decrypted number
 */
export const decryptNumber = (encryptedValue) => {
  if (!encryptedValue) return 0;
  const decrypted = decrypt(encryptedValue);
  return decrypted ? parseFloat(decrypted) || 0 : 0;
};
