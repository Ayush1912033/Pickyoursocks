import { supabase } from './supabase';

/**
 * End-to-End Encryption Utility using Web Crypto API
 */

// Key Storage
const PRIVATE_KEY_NAME = 'pys_chat_private_key';
const PUBLIC_KEY_NAME = 'pys_chat_public_key';

/**
 * Generates an RSA-OAEP key pair for the user.
 * Stores private key in localStorage and returns the public key as a string.
 */
export async function generateAndStoreKeys(userId: string) {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    // Export keys
    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const publicKeyString = arrayBufferToBase64(publicKeyBuffer);
    const privateKeyString = arrayBufferToBase64(privateKeyBuffer);

    // Store private key locally
    localStorage.setItem(PRIVATE_KEY_NAME, privateKeyString);
    localStorage.setItem(PUBLIC_KEY_NAME, publicKeyString);

    // Save public key to Supabase profile
    const { error } = await supabase
        .from('profiles')
        .update({ public_key: publicKeyString })
        .eq('id', userId);

    if (error) throw error;

    return publicKeyString;
}

/**
 * Encrypts a message using a recipient's public key.
 */
export async function encryptMessage(content: string, recipientPublicKeyString: string) {
    const publicKeyBuffer = base64ToArrayBuffer(recipientPublicKeyString);
    const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        data
    );

    return arrayBufferToBase64(encryptedBuffer);
}

/**
 * Decrypts a message using the user's stored private key.
 */
export async function decryptMessage(encryptedContentBase64: string) {
    const privateKeyString = localStorage.getItem(PRIVATE_KEY_NAME);
    if (!privateKeyString) throw new Error("Private key not found");

    const privateKeyBuffer = base64ToArrayBuffer(privateKeyString);
    const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );

    const encryptedBuffer = base64ToArrayBuffer(encryptedContentBase64);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

// Helpers
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
