const PBKDF2_ITERATIONS = 310_000;
const PREFIX = "e2ee:v1:";

let activeVaultKey: CryptoKey | null = null;

export function setVaultKey(key: CryptoKey | null) {
  activeVaultKey = key;
}

export function getVaultKey(): CryptoKey | null {
  return activeVaultKey;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * KEY 1 (AUTH KEY): Sent to the backend for login/register.
 * Proves you know the master password without revealing it to the server.
 */
export async function deriveAuthPassword(
  masterPassword: string,
  username: string
): Promise<string> {
  const encoder = new TextEncoder();

  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const authSalt = encoder.encode(`securepass:auth:${username.toLowerCase().trim()}`);

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: authSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    256
  );

  return bytesToBase64(new Uint8Array(derivedBits));
}

/**
 * KEY 2 (VAULT KEY): Stays strictly in RAM. Never sent over the network.
 * Encrypts and decrypts vault entries locally.
 */
export async function deriveVaultKey(
  masterPassword: string,
  username: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const vaultSalt = encoder.encode(`securepass:vault:${username.toLowerCase().trim()}`);

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: vaultSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext into "e2ee:v1:<base64_iv>:<base64_ciphertext>"
 */
export async function encryptSecret(plaintext: string): Promise<string> {
  if (!plaintext) return plaintext;
  if (!activeVaultKey) {
    throw new Error("VAULT_LOCKED: Encryption key missing from memory.");
  }

  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    activeVaultKey,
    encoder.encode(plaintext)
  );

  const ivB64 = bytesToBase64(iv);
  const cipherB64 = bytesToBase64(new Uint8Array(encryptedBuffer));

  return `${PREFIX}${ivB64}:${cipherB64}`;
}

/**
 * Decrypts "e2ee:v1:<iv>:<ciphertext>" back to plaintext.
 */
export async function decryptSecret(payload: string): Promise<string> {
  if (!payload || !payload.startsWith(PREFIX)) {
    return payload;
  }

  if (!activeVaultKey) {
    return "[LOCKED_KEY_REQUIRED]";
  }

  try {
    const withoutPrefix = payload.slice(PREFIX.length);
    const [ivB64, cipherB64] = withoutPrefix.split(":");
    if (!ivB64 || !cipherB64) return "[CORRUPT_CIPHERTEXT]";

    const iv = base64ToBytes(ivB64);
    const cipherBytes = base64ToBytes(cipherB64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      activeVaultKey,
      cipherBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    return "[DECRYPTION_FAILED_WRONG_KEY]";
  }
}