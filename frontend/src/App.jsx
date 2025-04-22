import React, { useEffect, useRef, useState } from 'react';
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
      const en_msg = await encryptMessage(message);
      socketRef.current.emit('send', en_msg);
      const encryptedHex = Array.from(en_msg)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      setmessages((prevMessages) => [
        `Sent: ${message}\nEncrypted: ${encryptedHex}`,
        ...prevMessages,
      ]);
    }
  };
  const handleMessage = async (msg) => {
    const encryptedHex = Array.from(new Uint8Array(msg))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const decryptedMessage = await decryptMessage(msg);
    setmessages((prevMessages) => [
      `Received (Encrypted): ${encryptedHex}\nDecrypted: ${decryptedMessage}`,
      ...prevMessages,
    ]);
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
    socketRef.current = io('https://encypt-chatapp.onrender.com');

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg flex flex-col h-[90vh]">
        <div className="bg-blue-600 text-white text-center py-4 rounded-t-xl text-2xl font-semibold">
          WeChat Secure Chat 💬
        </div>
  
        {!sharesecretkey && (
          <div className="px-4 py-2 text-center text-sm bg-yellow-100 text-yellow-800">
            <p>
              Become the second client to see both encrypted and decrypted messages.
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Connect as other client
            </a>
          </div>
        )}
  
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] px-4 py-2 rounded-lg shadow-sm break-words ${
                msg.startsWith("Received") // Check if it's a received message
                  ? "bg-green-200 self-start" // Green background for received messages
                  : "bg-blue-200 self-end ml-auto" // Blue background for sent messages
              }`}
            >
              <span className="text-sm text-gray-800 whitespace-pre-wrap">{msg}</span>
            </div>
          ))}
        </div>
  
        {/* Input field */}
        <div className="p-4 border-t flex items-center gap-2">
          <input
            className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setmessage(e.target.value)}
          />
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition ${
              !sharesecretkey ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              if (sharesecretkey) {
                handlesend(message);
                setmessage('');
              }
            }}
            disabled={!sharesecretkey}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
  
}

export default App;
