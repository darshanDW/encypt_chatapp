import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import io from 'socket.io-client';

function App() {
  const socketRef = useRef(null);
  const roomid = 'dj';
  const [messages, setmessages] = useState([]);
  const [message, setmessage] = useState('');
  const [publicKey, setpublickey] = useState(null);
  const [aliceKeyPair, setalicekeypair] = useState(null);
  const [receivepublickey, setreceivepublickey] = useState(null);
  const [sharesecretkey, setsharesecretkey] = useState(null); // State for shared secret key

  const handlesend = (message) => {
    setmessages((prevMessages) => [...prevMessages, message]);
    if (socketRef.current) {
      socketRef.current.emit('send', message);
    }
  };

  const generateECDHKeys = async () => {
    try {
      const algorithm = { name: 'ECDH', namedCurve: 'P-256' };
      console.log(1);

      const aliceKeyPair = await window.crypto.subtle.generateKey(
        algorithm,
        true, // Extractable keys
        ['deriveKey', 'deriveBits']
      );
      setalicekeypair(aliceKeyPair);
      const exportedKey = await window.crypto.subtle.exportKey('raw', aliceKeyPair.publicKey);
      setpublickey(exportedKey); // Store the exported public key
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    socketRef.current = io('http://localhost:3050');

    socketRef.current.on('connect', () => {
      console.log('Connected:', socketRef.current.id);
      socketRef.current.emit('join_room', roomid);
      console.log(1);
      socketRef.current.on('both_clients_ready', () => {
        console.log('Both clients are ready, sharing key.');
        console.log(4);
        generateECDHKeys(); // Generate keys when both clients are ready
      });
      console.log(2);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      const handleMessage = (msg) => {
        console.log('Message received:', msg);
        setmessages((prevMessages) => [...prevMessages, msg]);
      };

      socketRef.current.on('receive', handleMessage);
      socketRef.current.on('receivekey', async (key) => {
        console.log(key);
        const importedPublicKey = await window.crypto.subtle.importKey(
          'raw', // Import raw format since it's received as raw
          key, // Bob's public key received over the network
          { name: 'ECDH', namedCurve: 'P-256' }, // ECDH with the same curve
          true, // Extractable
          [] // No key usage for public key
        );
        if (aliceKeyPair) {
          const aliceSharedSecret = await crypto.subtle.deriveBits(
            {
              name: 'ECDH',
              public: importedPublicKey,
            },
            aliceKeyPair.privateKey,
            256 // Length of the shared secret in bits
          );
          setsharesecretkey(aliceSharedSecret); // Store the derived shared secret

          // Convert shared secret to hex for logging
          const shareSecretHex = Array.from(new Uint8Array(aliceSharedSecret))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
          console.log('Shared secret (hex):', shareSecretHex);
        }

        console.log(importedPublicKey);
        const receiverKeyHex = Array.from(new Uint8Array(key))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        console.log('Received key (hex):', receiverKeyHex);
        setreceivepublickey(receiverKeyHex); // Optionally store the received key in a state
      });

      return () => {
        socketRef.current.off('message', handleMessage);
      };
    }
  }, [aliceKeyPair]);

  useEffect(() => {
    if (publicKey && socketRef.current) {
      socketRef.current.emit('sharekey', publicKey); // Emit the public key
      console.log('Public key shared:', publicKey);

      const publichexkey = Array.from(new Uint8Array(publicKey))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      console.log('Public key (hex):', publichexkey); // Log the public key in hex format
    }
  }, [publicKey]);

  return (
    <>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <input type='text' value={message} onChange={(e) => setmessage(e.target.value)} />
      <button onClick={() => handlesend(message)}>Send</button>
    </>
  );
}

export default App;
