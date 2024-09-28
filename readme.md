# Chat App with Encryption and Decryption

This project is a chat application where messages are encrypted and decrypted between clients. It uses React.js for the frontend and Node.js for the backend, with Firebase for real-time communication and message storage.

## Features
- Sign up and log in using Firebase Authentication
- Send messages in real-time
- Messages are encrypted and decrypted during communication
- Analyze sentiments of messages
- Generate and download a PDF report of chat analysis

## Tech Stack
- **Frontend:** React.js, Chart.js, Sentiment.js, jsPDF.js
- **Backend:** Node.js, Firebase (Firestore, Realtime Database, Authentication)

---

## Getting Started

### Step 0: Clone the Repository
1. Clone the project repository:
   ```bash
   git clone <your-repo-url>
2. Navigate into the project directory:
   ```bash
    cd <your-project-directory>
Step 1: Set up the Frontend
3. Navigate to the frontend folder:
   ```bash
    cd frontend
4. Install dependencies:
    ```bash
    npm install
5. Start the development server:
   ```bash     
   npm run dev
Step 2: Set up the Backend
6. Navigate to the backend folder:
    ```bash
    cd ../backend
7. Install backend dependencies:
    ```bash
    npm install
8. Start the backend server:
    ```bash
    node index.js
Step 3: Test the Chat Application
Open two or more browser windows (or tabs).
Send a message from one client and view the encrypted and decrypted message in real-time on other clients.