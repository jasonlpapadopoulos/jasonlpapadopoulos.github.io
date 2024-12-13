const firebaseConfig = {
    apiKey: "AIzaSyDlz2DgGutIzZxM0XgsBcXAczF37dSrezc",
    authDomain: "plana-auth.firebaseapp.com",
    projectId: "plana-auth",
    storageBucket: "plana-auth.firebasestorage.app",
    messagingSenderId: "722766994352",
    appId: "1:722766994352:web:62b3c377022a3c153d1475",
    measurementId: "G-7PJ0RDHV54"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();