import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>,
)
/*  import React, { useState, useEffect } from 'react';

function ECDHComponent() {
  const [aliceSharedKey, setAliceSharedKey] = useState('');
  const [bobSharedKey, setBobSharedKey] = useState('');
  const [keysMatch, setKeysMatch] = useState(false);

  // Function to generate keys and compute shared secrets
  const generateECDHKeys = async () => {
    try {
      // Generate Alice's key pair
      const aliceKeyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256', // Use P-256 curve
        },
        true,
        ['deriveKey', 'deriveBits']
      );

      // Generate Bob's key pair
      const bobKeyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits']
      );

      // Export and import public keys (simulating exchanging keys)
      const alicePublicKey = await crypto.subtle.exportKey('spki', aliceKeyPair.publicKey);
      const bobPublicKey = await crypto.subtle.exportKey('spki', bobKeyPair.publicKey);

      const importedBobPublicKey = await crypto.subtle.importKey(
        'spki',
        bobPublicKey,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
      );

      const importedAlicePublicKey = await crypto.subtle.importKey(
        'spki',
        alicePublicKey,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
      );

      // Derive shared secret for Alice
      const aliceSharedSecret = await crypto.subtle.deriveBits(
        {
          name: 'ECDH',
          public: importedBobPublicKey,
        },
        aliceKeyPair.privateKey,
        256 // Length of the shared secret in bits
      );

      // Derive shared secret for Bob
      const bobSharedSecret = await crypto.subtle.deriveBits(
        {
          name: 'ECDH',
          public: importedAlicePublicKey,
        },
        bobKeyPair.privateKey,
        256
      );

      // Convert shared secrets to hex format
      const aliceSharedKeyHex = Array.from(new Uint8Array(aliceSharedSecret))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const bobSharedKeyHex = Array.from(new Uint8Array(bobSharedSecret))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Update state
      setAliceSharedKey(aliceSharedKeyHex);
      setBobSharedKey(bobSharedKeyHex);
      setKeysMatch(aliceSharedKeyHex === bobSharedKeyHex);
    } catch (error) {
      console.error('Error generating ECDH keys:', error);
    }
  };

  // Run key generation when the component mounts
  useEffect(() => {
    generateECDHKeys();
  }, []);

  return (
    <div>
      <h1>ECDH Key Exchange with Web Crypto API</h1>
      <p><strong>Alice's Shared Key:</strong> {aliceSharedKey}</p>
      <p><strong>Bob's Shared Key:</strong> {bobSharedKey}</p>
      <p>
        <strong>Do the shared keys match?</strong> {keysMatch ? 'Yes' : 'No'}
      </p>
    </div>
  );
}

export default ECDHComponent;


*/