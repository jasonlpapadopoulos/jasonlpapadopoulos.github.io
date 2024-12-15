const accountContent = document.getElementById('account-content');

// Check authentication state
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in
    accountContent.innerHTML = `
      <p>You are logged in as <strong>${user.email}</strong></p>
      <button id="logout-button">Log Out</button>
    `;
    document.getElementById('logout-button').addEventListener('click', () => {
      auth.signOut().then(() => {
        console.log('User logged out');
      }).catch((error) => {
        console.error('Error logging out:', error.message);
      });
    });
  } else {
    // User is not logged in
    accountContent.innerHTML = `
    <div id="account-container">
      <h3>First time here?</h3>
      <form id="signup-form" class="animated-form">
        <div class="input-container">
          <i class="icon fa fa-envelope"></i>
          <input type="email" id="signup-email" placeholder="Email" required>
        </div>
        <div class="input-container">
          <i class="icon fa fa-lock"></i>
          <input type="password" id="signup-password" placeholder="Password" required>
        </div>
        <div class="input-container">
          <i class="icon fa fa-user"></i>
          <input type="text" id="signup-first-name" placeholder="First Name" required>
        </div>
        <button type="submit" class="cta-button">Sign Up</button>
      </form>
    </div>
    <div id="account-container">
      <h3>Already a Planaer?</h3>
      <form id="login-form" class="animated-form">
        <div class="input-container">
          <i class="icon fa fa-envelope"></i>
          <input type="email" id="login-email" placeholder="Email" required>
        </div>
        <div class="input-container">
          <i class="icon fa fa-lock"></i>
          <input type="password" id="login-password" placeholder="Password" required>
        </div>
        <button type="submit" class="cta-button">Log In</button>
      </form>
      <p id="login-error-message" class="error-message" style="display: none;"></p>
      <p>
        <button id="forgot-password-button" class="link-button" type="button">Forgot My Password</button>
      </p>
    </div>
    <div id="account-container">
      <h3>Too busy for any of that?</h3>
      <p>
        <button id="guest-button" class="cta-button guest-button" type="button">Continue as Guest</button>
      </p>
    </div>
  `;
  
    // Attach form event listeners
// Attach form event listeners
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('signup-first-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
    
        auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
    
            // Send user data to your backend
            fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firebaseUid: user.uid,
                email: user.email,
                firstName: firstName
            }),
            })
            .then((response) => response.json())
            .then((data) => {
                console.log('User added to database:', data);
            })
            .catch((error) => {
                console.error('Error adding user to database:', error);
            });
        })
        .catch((error) => {
            console.error('Error signing up:', error.message);
        });
    });
  
    document.getElementById('guest-button').addEventListener('click', () => {
        accountContent.innerHTML = `<h2>Welcome, Guest!</h2>`;
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMessageElement = document.getElementById('login-error-message');
      
        auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Clear any previous error messages
            errorMessageElement.style.display = 'none';
            console.log('User logged in:', userCredential.user);
          })
          .catch((error) => {
            // Display error message
            errorMessageElement.style.display = 'block';
            errorMessageElement.textContent = getFriendlyErrorMessage(error.code);
            console.error('Error logging in:', error.message);
          });
      });

    // Password reset
    document.getElementById('forgot-password-button').addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
    
        if (!email) {
        alert('Please enter your email address to reset your password.');
        return;
        }
    
        auth.sendPasswordResetEmail(email)
        .then(() => {
            alert('Password reset email sent. Please check your inbox.');
        })
        .catch((error) => {
            console.error('Error sending password reset email:', error.message);
            alert(`Error: ${error.message}`);
        });
    });
      
      // Function to return user-friendly error messages
      function getFriendlyErrorMessage(errorCode) {
        switch (errorCode) {
          case 'auth/invalid-email':
            return 'Invalid email address format.';
          case 'auth/user-not-found':
            return 'No account found with this email. Please sign up.';
          case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
          case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
          default:
            return 'Incorrect email or password.';
        }
      }
      

    // // Google Sign-In
    // document.getElementById('google-sign-in-button').addEventListener('click', () => {
    //     const provider = new firebase.auth.GoogleAuthProvider();
    //     e.preventDefault();
    //     // Optional: Add scopes or customize sign-in behavior
    //     provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    //     provider.setCustomParameters({
    //     prompt: 'select_account' // Forces account selection every time
    //     });
    
    //     auth.signInWithPopup(provider)
    //     .then((result) => {
    //         // This gives you a Google Access Token. You can use it to access the Google API.
    //         const credential = result.credential;
    //         const token = credential.accessToken;
    
    //         // The signed-in user info
    //         const user = result.user;
    //         console.log('User signed in with Google:', user);
    //     })
    //     .catch((error) => {
    //         console.error('Error signing in with Google:', error.message);
    //     });
    // });
    

  }
});
