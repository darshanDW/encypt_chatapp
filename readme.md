Encrypted Chat Application
This project is a real-time chat application with end-to-end encryption, sentiment analysis, and report generation features. It uses React.js for the frontend and Node.js for the backend, with Firebase for real-time communication and message storage.
Features

User authentication (sign up and log in) using Firebase Authentication
Real-time messaging with end-to-end encryption
Sentiment analysis of messages
Generate and download PDF reports of chat analysis
Responsive design for various screen sizes

Tech Stack

Frontend:

React.js
React Router for navigation
Firebase SDK for authentication and real-time database
Chart.js for data visualization
CryptoJS for message encryption/decryption


Backend:

Node.js
Express.js
Firebase Admin SDK
Sentiment.js for sentiment analysis
PDFKit for PDF generation



Prerequisites
Before you begin, ensure you have met the following requirements:

Node.js (v14.0.0 or later)
npm (v6.0.0 or later)
Firebase account and project

Getting Started
Clone the Repository
bashCopygit clone https://github.com/darshanDW/encypt_chatapp.git
cd encypt_chatapp
Frontend Setup

Navigate to the frontend directory:
bashCopycd frontend

Install dependencies:
bashCopynpm install

Create a .env file in the frontend directory and add your Firebase configuration:
CopyREACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

Start the development server:
bashCopynpm start


Backend Setup

Navigate to the backend directory:
bashCopycd backend

Install dependencies:
bashCopynpm install

Create a serviceAccountKey.json file in the backend directory with your Firebase Admin SDK credentials.
Start the backend server:
bashCopynode index.js


Usage

Open your web browser and go to http://localhost:3000
Sign up for a new account or log in with existing credentials
Start chatting! Your messages will be automatically encrypted before sending and decrypted upon receipt
Use the sentiment analysis feature to analyze the mood of the conversation
Generate a PDF report of the chat analysis when needed

Contributing
Contributions to the Encrypted Chat Application are welcome. Please follow these steps:

Fork the repository
Create a new branch: git checkout -b feature-branch-name
Make your changes and commit them: git commit -m 'Add some feature'
Push to the branch: git push origin feature-branch-name
Create a pull request

License
This project is licensed under the MIT License - see the LICENSE.md file for details.
Contact
If you have any questions or feedback, please contact:
Your Name - email@example.com
Project Link: https://github.com/yourusername/encrypted-chat-app