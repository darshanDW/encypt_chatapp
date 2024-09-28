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
  console.log("----", new Uint8Array(sharesecretkey).map((b) => b.toString(16).padStart(2, '0'))
    .join(''))
  const handlesend = async (message) => {
    if (socketRef.current && sharesecretkey) {
      console.log(46666)
      const en_msg = await encryptMessage(message)
      socketRef.current.emit('send', en_msg);
      const x = Array.from(en_msg)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      console.log(x)
      setmessages((prevMessages) => [...prevMessages, `send message   ${message}       :      encrypted message ${x}`]); // Joining them side by side

    }

  };
  const handleMessage = async (msg) => {

    console.log('Message received:',);
    const x = Array.from(new Uint8Array(msg))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    console.log(x)
    const uint8Array = new Uint8Array(msg);

    const decodedString = new TextDecoder().decode(uint8Array);

    const decryptedMessage = await decryptMessage(msg);
    console.log(9999)
    setmessages((prevMessages) => [...prevMessages, `decrypted message${decryptedMessage}:  receive message ${x}`]); // Joining them side by side
    console.log(8888)
  };

  const generateECDHKeys = async () => {
    try {
      const algorithm = { name: 'ECDH', namedCurve: 'P-256' };
      console.log(1);

      const aliceKeyPair = await window.crypto.subtle.generateKey(
        algorithm,
        true,
        ['deriveKey', 'deriveBits']
      );
      setalicekeypair(aliceKeyPair);
      const exportedKey = await window.crypto.subtle.exportKey('raw', aliceKeyPair.publicKey);
      setpublickey(exportedKey);
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
        generateECDHKeys();
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


    socketRef.current.on('receivekey', async (key) => {
      console.log(key);
      const importedPublicKey = await window.crypto.subtle.importKey(
        'raw',
        key,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
      );
      if (aliceKeyPair) {
        const aliceSharedSecret = await crypto.subtle.deriveBits(
          {
            name: 'ECDH',
            public: importedPublicKey,
          },
          aliceKeyPair.privateKey,
          256
        );
        setsharesecretkey(aliceSharedSecret);

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
      setreceivepublickey(receiverKeyHex);
    });


    return () => {
      socketRef.current.off('message', handleMessage);
    };
  }
    , [aliceKeyPair]);
  useEffect(() => {
    if (socketRef.current && sharesecretkey) {

      socketRef.current.on('receive', (msg) => { handleMessage(msg) });
    }

  }, [sharesecretkey])
  useEffect(() => {
    if (publicKey && socketRef.current) {
      socketRef.current.emit('sharekey', publicKey);
      console.log('Public key shared:', publicKey);

      const publichexkey = Array.from(new Uint8Array(publicKey))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      console.log('Public key (hex):', publichexkey);
    }
  }, [publicKey]);


  async function encryptMessage(message) {
    const IV = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM

    const encodedMessage = new TextEncoder().encode(message);
    console.log("main key", new Uint8Array(sharesecretkey).map((b) => b.toString(16).padStart(2, '0'))
      .join(''));
    const cipher = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: IV,
      },
      await window.crypto.subtle.importKey('raw', sharesecretkey, 'AES-GCM', true, ['encrypt']),
      encodedMessage
    );

    const encryptedMessage = new Uint8Array(cipher);
    const payload = new Uint8Array(IV.length + encryptedMessage.length);
    payload.set(IV);
    payload.set(encryptedMessage, IV.length);

    return payload;
  }

  async function decryptMessage(payload) {
    const IV = payload.slice(0, 12); // Extract IV
    const encryptedMessage = payload.slice(12); // Extract encrypted message
    console.log("main key:", new Uint8Array(sharesecretkey).map((b) => b.toString(16).padStart(2, '0'))
      .join(''))
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      new Uint8Array(sharesecretkey), // ECDH-derived key
      'AES-GCM',
      true,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: IV,
      },
      aesKey,
      encryptedMessage
    );

    return new TextDecoder().decode(decrypted); // Decode to string
  }
  


  return (
    <>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <input type='text' value={message} onChange={(e) => setmessage(e.target.value)} />
      <button onClick={(sharesecretkey) => { if (sharesecretkey) { handlesend(message) } }}>Send</button>

      {/* file sharing */}

      <input type='file' id='file' />

      <button onClick={() => {
        const file = document.getElementById('file').files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileData = e.target.result;
          const encryptedFile = await encryptMessage(fileData);
          socketRef.current.emit('send', encryptedFile);
        };
        reader.readAsArrayBuffer(file);
      }
      }>Send
      </button>


      {/* for received file */}

      <input type='file' id='file' />

      <button onClick={() => {
        const file = document.getElementById('file').files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileData = e.target.result;
          const decryptedFile = await decryptMessage(fileData);
          const blob = new Blob([decryptedFile]);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
        };
        reader.readAsArrayBuffer(file);
      }
      }>Download
      </button>




    </>
  );
}

export default App;
