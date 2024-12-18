const accountContent = document.getElementById('account-content');

const API_BASE_URL =
window.location.hostname === ''
    ? 'http://localhost:3000' // Development URL
    : 'https://jasonlpapadopoulos-github-io.onrender.com';

// Check authentication state
auth.onAuthStateChanged((user) => {
  if (user) {

    accountContent.innerHTML = `
    <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading your account...</p>
    </div>
    `;

    // Fetch user's first name
    fetch(`${API_BASE_URL}/get-user?firebaseUid=${user.uid}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then(data => {
        // Update the account content with personalized welcome
        accountContent.innerHTML = `
          <p class="title">Welcome, ${data.firstName || user.email}!</p>
          <button class="city-button" id="logout-button">Log Out</button>
        `;
        
        // Re-attach logout button event listener
        document.getElementById('logout-button').addEventListener('click', () => {
          auth.signOut().then(() => {
            console.log('User logged out');
          }).catch((error) => {
            console.error('Error logging out:', error.message);
          });
        });
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        // Fallback to email if first name fetch fails
        accountContent.innerHTML = `
          <p>Welcome, ${user.email}!</p>
          <button class="cta-button" id="logout-button">Log Out</button>
        `;
        
        document.getElementById('logout-button').addEventListener('click', () => {
          auth.signOut().then(() => {
            console.log('User logged out');
          }).catch((error) => {
            console.error('Error logging out:', error.message);
          });
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


    document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('signup-first-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
        const user = userCredential.user;

        // Send user data to your backend
        fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            firebaseUid: user.uid,
            email: user.email,
            firstName: firstName,
            }),
        })
            .then((response) => response.json())
            .then((data) => console.log('User added to database:', data))
            .catch((error) => console.error('Error adding user to database:', error));
        })
        .catch((error) => {
        console.error('Error signing up:', error.message);
        });
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

    document.getElementById('guest-button').addEventListener('click', () => {
        accountContent.innerHTML = `<h2>Welcome, Guest!</h2>`;
    });
    
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

    }
});
