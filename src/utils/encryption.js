const crypto = require('crypto');

/**
 * Advanced Cryptography Utility - Team T066
 * Implements AES-256-GCM with Dynamic IV and Error Shielding.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; 

// Functional approach ensures keys are loaded ONLY when needed 
// (Prevents crashes if env is not yet loaded during require)
const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error("Invalid ENCRYPTION_KEY: Must be 64-character hex.");
    }
    return Buffer.from(key, 'hex');
};

/**
 * Encrypts plaintext into IV:AuthTag:Ciphertext format
 */
function encrypt(text) {
    if (!text) return null;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag().toString('hex');
        
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error('Encryption Error [T066]:', error.message);
        throw new Error('Encryption failed');
    }
}

/**
 * Decrypts and validates the integrity of the data
 */
function decrypt(combined) {
    if (!combined || typeof combined !== 'string') return null;
    
    try {
        const parts = combined.split(':');
        if (parts.length !== 3) {
            throw new Error("Invalid encrypted format");
        }

        const [ivHex, authTagHex, encryptedText] = parts;
        
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
        
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        // We log the error but don't crash the server. 
        // We return null so the service can handle it gracefully.
        console.error('Decryption Error [T066]: Check ENCRYPTION_KEY or data integrity.', error.message);
        return null;
    }
}

module.exports = { encrypt, decrypt };