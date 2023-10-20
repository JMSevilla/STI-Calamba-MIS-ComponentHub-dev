import CryptoJS from 'crypto-js';

export const encrypt = (data: string, secretKey: string) => {
  const iv = CryptoJS.lib.WordArray.random(16); // 128 bits (16 bytes) IV
  const encrypted = CryptoJS.AES.encrypt(data, secretKey, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
  });
  return iv.toString() + encrypted.toString();
};

// Decryption function with IV and padding
export const decrypt = (encryptedData: string, secretKey: string) => {
  const iv = CryptoJS.enc.Hex.parse(encryptedData.slice(0, 32)); // Assuming a 16-byte (128-bit) IV
  const encryptedText = encryptedData.slice(32); // Remove IV from the encrypted data
  const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};