/**
 * Encrypts a plaintext string using AES-GCM, returning a single base64 string.
 * @param {string} plainText - The data to encrypt.
 * @param {string} keyString - A string key that will be used to derive the encryption key.
 * @returns {Promise<string>} A base64-encoded string containing the encrypted data.
 */
export async function encrypt(plainText: string, keyString: string): Promise<string> {
  // Convert the string key to a CryptoKey
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyString),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive the encryption key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(keyString),
      iterations: 1,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Создаем IV из хеша ключа
  const keyHash = await crypto.subtle.digest('SHA-256', encoder.encode(keyString));
  const iv = new Uint8Array(keyHash).slice(0, 12);

  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plainText)
  );

  // Combine IV and encrypted data
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...result));
}

/**
 * Decrypts a base64-encoded string produced by the encrypt() function.
 * @param {string} encryptedBase64 - The base64 string returned by encrypt().
 * @param {string} keyString - The same string key used during encryption.
 * @returns {Promise<string>} The original plaintext string.
 */
export async function decrypt(encryptedBase64: string, keyString: string): Promise<string> {
  // Convert base64 to Uint8Array
  const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // Extract IV and ciphertext
  const iv = encrypted.slice(0, 12);
  const ciphertext = encrypted.slice(12);

  // Convert the string key to a CryptoKey
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyString),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive the decryption key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(keyString),
      iterations: 1,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  // Convert the decrypted data to a string
  return new TextDecoder().decode(decrypted);
}
