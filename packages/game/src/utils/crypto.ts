import CryptoJS from 'crypto-js';

/**
 * Проверяет доступность Web Crypto API
 */
function isCryptoAvailable(): boolean {
  return typeof window !== 'undefined' &&
    window.crypto !== undefined &&
    window.crypto.subtle !== undefined;
}

/**
 * Простая реализация шифрования, когда Web Crypto API недоступен
 */
function simpleEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

/**
 * Простая реализация дешифрования, когда Web Crypto API недоступен
 */
function simpleDecrypt(encrypted: string, key: string): string {
  const text = atob(encrypted);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/**
 * Encrypts a plaintext string using AES, returning a single base64 string.
 * @param {string} plainText - The data to encrypt.
 * @param {string} keyString - A string key that will be used for encryption.
 * @returns {Promise<string>} A base64-encoded string containing the encrypted data.
 */
export async function encrypt(plainText: string, keyString: string): Promise<string> {
  // Создаем ключ из строки
  const key = CryptoJS.PBKDF2(keyString, keyString, {
    keySize: 256 / 32,
    iterations: 1
  });

  // Шифруем данные
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  // Возвращаем результат в формате base64
  return encrypted.toString();
}

/**
 * Decrypts a base64-encoded string produced by the encrypt() function.
 * @param {string} encryptedBase64 - The base64 string returned by encrypt().
 * @param {string} keyString - The same string key used during encryption.
 * @returns {Promise<string>} The original plaintext string.
 */
export async function decrypt(encryptedBase64: string, keyString: string): Promise<string> {
  try {
    // Создаем ключ из строки
    const key = CryptoJS.PBKDF2(keyString, keyString, {
      keySize: 256 / 32,
      iterations: 1
    });

    // Расшифровываем данные
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Преобразуем результат в строку
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}
