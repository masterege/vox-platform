import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = "vox-secret-key-123";

export const encryptMessage = (text: string) => {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

export const decryptMessage = (cipher: string) => {
    try {
        return CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8) || cipher;
    } catch {
        return cipher; // Fallback if not encrypted
    }
};