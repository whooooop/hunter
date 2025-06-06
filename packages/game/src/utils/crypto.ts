import CryptoJS from 'crypto-js';

/**
 * Проверяет валидность входных данных
 */
function validateInput(text: string, key: string): boolean {
  return typeof text === 'string' &&
    typeof key === 'string' &&
    text.length > 0 &&
    key.length > 0;
}

/**
 * Encrypts a plaintext string using AES, returning a single base64 string.
 * @param {string} plainText - The data to encrypt.
 * @param {string} keyString - A string key that will be used for encryption.
 * @returns {Promise<string>} A base64-encoded string containing the encrypted data.
 */
export async function encrypt(plainText: string, keyString: string): Promise<string> {
  try {
    if (!validateInput(plainText, keyString)) {
      console.warn('Invalid input for encryption:', { plainText, keyString });
      return '';
    }

    // Создаем ключ из строки
    const key = CryptoJS.PBKDF2(keyString, keyString, {
      keySize: 256 / 32,
      iterations: 1
    });

    // Создаем IV из хеша ключа для дополнительной безопасности
    const iv = CryptoJS.SHA256(keyString).toString().slice(0, 16);

    // Шифруем данные
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Возвращаем результат в формате base64
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

/**
 * Decrypts a base64-encoded string produced by the encrypt() function.
 * @param {string} encryptedBase64 - The base64 string returned by encrypt().
 * @param {string} keyString - The same string key used during encryption.
 * @returns {Promise<string>} The original plaintext string.
 */
export async function decrypt(encryptedBase64: string, keyString: string): Promise<string> {
  try {
    if (!validateInput(encryptedBase64, keyString)) {
      console.warn('Invalid input for decryption:', { encryptedBase64, keyString });
      return '';
    }

    // Создаем ключ из строки
    const key = CryptoJS.PBKDF2(keyString, keyString, {
      keySize: 256 / 32,
      iterations: 1
    });

    // Создаем IV из хеша ключа
    const iv = CryptoJS.SHA256(keyString).toString().slice(0, 16);

    // Расшифровываем данные
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Преобразуем результат в строку
    const result = decrypted.toString(CryptoJS.enc.Utf8);

    // Проверяем результат расшифровки
    if (!result) {
      console.warn('Decryption resulted in empty string');
      return '';
    }

    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}
