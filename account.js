// Constants
const API_BASE_URL = window.location.hostname === '' 
  ? 'http://localhost:3000' 
  : 'https://jasonlpapadopoulos-github-io.onrender.com';

  class AccountManager {
    constructor() {
      this.accountContent = document.getElementById('account-content');
      this.isSignUpActive = true;  // Default to showing the sign-up form
      this.initializeAuthListener();
    }
  
    // Initialize Firebase Auth listener
    initializeAuthListener() {
      auth.onAuthStateChanged(this.handleAuthStateChange.bind(this));
    }
  
    // Handle authentication state changes
    async handleAuthStateChange(user) {
      if (user) {
        // Show welcome screen immediately with loading state
        this.renderWelcomeScreen(user.email, true);
        try {
          const userData = await this.fetchUserData(user.uid);
          // Update screen with user's first name
          this.renderWelcomeScreen(userData?.firstName || user.email, false);
        } catch (error) {
          console.error('Error handling authenticated user:', error);
          this.renderWelcomeScreen(user.email, false);
        }
      } else {
        this.renderAuthenticationForms();
      }
    }
  
    renderWelcomeScreen(name, isLoading = false) {
      this.accountContent.innerHTML = `
        <p class="title">Welcome, ${name}!</p>
        ${isLoading ? `
          <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading your data...</p>
          </div>
        ` : `
          <button class="city-button" id="logout-button">Log Out</button>
        `}
      `;
      
      if (!isLoading) {
        document.getElementById('logout-button').addEventListener('click', this.handleLogout.bind(this));
      }
    }

    // Handle authenticated user state
    async handleAuthenticatedUser(user) {
      // Show welcome screen immediately with loading spinner
      this.renderWelcomeScreen(user.email, true);
      try {
        const userData = await this.fetchUserData(user.uid);
        this.renderWelcomeScreen(userData?.firstName || user.email, false);
      } catch (error) {
        console.error('Error handling authenticated user:', error);
        this.renderWelcomeScreen(user.email, false);
      }
    }
  
    // Fetch user data from server
    async fetchUserData(firebaseUid) {
      const response = await fetch(`${API_BASE_URL}/get-user?firebaseUid=${firebaseUid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    }
    
    // Sign up new user
    async handleSignUp(event) {
      event.preventDefault();
      const formData = this.getSignUpFormData();
      this.showLoadingState();
      
      try {
        console.log('Starting signup process...');
        
        // 1. Create Firebase account
        console.log('Creating Firebase account...');
        const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
        console.log('Firebase account created successfully:', userCredential.user.uid);
        
        // 2. Create user in database with retry logic
        console.log('Attempting to create user in database...');
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Add explicit CORS headers
                'Accept': 'application/json',
              },
              // Add explicit CORS settings
              mode: 'cors',
              credentials: 'include',
              body: JSON.stringify({
                firebaseUid: userCredential.user.uid,
                email: formData.email,
                firstName: formData.firstName,
              }),
            });
    
            // Log the response status and headers
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
    
            if (!response.ok) {
              throw new Error(`Server responded with status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Database creation successful:', data);
            
            // If we get here, the request was successful
            this.renderWelcomeScreen(formData.firstName);
            return;
            
          } catch (error) {
            console.error(`Attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            
            if (retryCount === maxRetries) {
              // If all retries failed, throw the error to be caught by outer catch
              throw new Error(`Failed to create user in database after ${maxRetries} attempts: ${error.message}`);
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      } catch (error) {
        console.error('Signup error:', error);
        this.showError('signup-error-message', this.getFriendlyErrorMessage(error.code) || error.message);
        
        // If database creation failed but Firebase account was created,
        // we should still allow the user to proceed but log the error
        if (error.message.includes('Failed to create user in database')) {
          console.warn('Proceeding with Firebase-only account due to database error');
          this.renderWelcomeScreen(formData.firstName);
        }
      }
    }
  
    // Create user in database
    async createUserInDatabase(user, firstName) {
      console.log('Starting database user creation...');
      
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          firstName: firstName,
        }),
      });
    
      console.log('Database response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Database error response:', errorText);
        throw new Error(`Failed to create user in database: ${errorText}`);
      }
      
      return response.json();
    }

    // Handle user login
    async handleLogin(event) {
      event.preventDefault();
      const { email, password } = this.getLoginFormData();
      // Show loading state immediately after click
      this.showLoadingState();
      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (error) {
        this.showError('login-error-message', this.getFriendlyErrorMessage(error.code));
      }
    }

    handleLogout() {
      auth.signOut()
        .then(() => console.log('User logged out'))
        .catch(error => console.error('Error logging out:', error));
    }

    // UI Rendering Methods
    showLoadingState() {
      this.accountContent.innerHTML = `
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading your account...</p>
        </div>
      `;
    }
  
    renderWelcomeScreen(name) {
      this.accountContent.innerHTML = `
        <p class="title">Welcome, ${name}!</p>
        ${name !== 'Guest' ? `
          <a href="what-are-you-looking-for.html" class="city-button">New York City</a>
          <button class="city-button" id="logout-button">Log Out</button>
        ` : ''}
      `;
      if (name !== 'Guest') {
        document.getElementById('logout-button').addEventListener('click', this.handleLogout.bind(this));
      }
    }
  
    // Main render function for forms
    renderAuthenticationForms() {
      if (this.isSignUpActive) {
        this.accountContent.innerHTML = `
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
              <p id="signup-error-message" class="error-message" style="display: none;"></p>
              <button type="submit" class="cta-button">Sign Up</button>
            </form>
            <p>
              Already have an account? <a href="#" id="toggle-to-login">Sign In</a>
            </p>
          </div>
        `;
      } else {
        this.accountContent.innerHTML = `
          <div id="account-container">
            <h3>Been here before?</h3>
            <form id="login-form" class="animated-form">
              <div class="input-container">
                <i class="icon fa fa-envelope"></i>
                <input type="email" id="login-email" placeholder="Email" required>
              </div>
              <div class="input-container">
                <i class="icon fa fa-lock"></i>
                <input type="password" id="login-password" placeholder="Password" required>
              </div>
              <p id="login-error-message" class="error-message" style="display: none;"></p>
              <button type="submit" class="cta-button">Log In</button>
            </form>
            <p>
              Don't have an account? <a href="#" id="toggle-to-signup">Sign Up</a>
            </p>
          </div>
        `;
      }
      this.attachEventListeners();
    }
  
    // Helper Methods
    attachEventListeners() {
      // Sign-up form submission
      document.getElementById('signup-form')?.addEventListener('submit', this.handleSignUp.bind(this));
      // Login form submission
      document.getElementById('login-form')?.addEventListener('submit', this.handleLogin.bind(this));
  
      // Toggle between forms
      document.getElementById('toggle-to-login')?.addEventListener('click', () => {
        this.isSignUpActive = false;
        this.renderAuthenticationForms();
      });
      document.getElementById('toggle-to-signup')?.addEventListener('click', () => {
        this.isSignUpActive = true;
        this.renderAuthenticationForms();
      });
    }
  
    getSignUpFormData() {
      return {
        firstName: document.getElementById('signup-first-name').value,
        email: document.getElementById('signup-email').value,
        password: document.getElementById('signup-password').value,
      };
    }
  
    getLoginFormData() {
      return {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
      };
    }
  
    showError(elementId, message) {
      const errorElement = document.getElementById(elementId);
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }
    }
  
    getFriendlyErrorMessage(errorCode) {
      const errorMessages = {
        'auth/invalid-email': 'Invalid email address format.',
        'auth/user-not-found': 'No account found with this email. Please sign up.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'default': 'An error occurred. Please try again.'
      };
      return errorMessages[errorCode] || errorMessages.default;
    }
  }
  
  // Initialize the account manager when the DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const accountManager = new AccountManager();
  });
  


// const accountContent = document.getElementById('account-content');

// accountContent.innerHTML = `
// <div class="loading-container">
//     <div class="spinner"></div>
//     <p>Loading your account...</p>
// </div>
// `;

// const API_BASE_URL =
// window.location.hostname === ''
//     ? 'http://localhost:3000' // Development URL
//     : 'https://jasonlpapadopoulos-github-io.onrender.com';

// // Check authentication state
// auth.onAuthStateChanged((user) => {
//   if (user) {

//     // Fetch user's first name
//     fetch(`${API_BASE_URL}/get-user?firebaseUid=${user.uid}`)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Failed to fetch user data');
//         }
//         return response.json();
//       })
//       .then(data => {
//         // Update the account content with personalized welcome
//         accountContent.innerHTML = `
//           <p class="title">Welcome, ${data.firstName || user.email}!</p>
//           <button class="city-button" id="logout-button">Log Out</button>
//         `;
        
//         // Re-attach logout button event listener
//         document.getElementById('logout-button').addEventListener('click', () => {
//           auth.signOut().then(() => {
//             console.log('User logged out');
//           }).catch((error) => {
//             console.error('Error logging out:', error.message);
//           });
//         });
//       })
//       .catch(error => {
//         console.error('Error fetching user data:', error);
//         // Fallback to email if first name fetch fails
//         accountContent.innerHTML = `
//           <p>Welcome, ${user.email}!</p>
//           <button class="cta-button" id="logout-button">Log Out</button>
//         `;
        
//         document.getElementById('logout-button').addEventListener('click', () => {
//           auth.signOut().then(() => {
//             console.log('User logged out');
//           }).catch((error) => {
//             console.error('Error logging out:', error.message);
//           });
//         });
//       });
//   } else {
//     // User is not logged in
//     accountContent.innerHTML = `
//     <div id="account-container">
//       <h3>First time here?</h3>
//       <form id="signup-form" class="animated-form">
//         <div class="input-container">
//           <i class="icon fa fa-envelope"></i>
//           <input type="email" id="signup-email" placeholder="Email" required>
//         </div>
//         <div class="input-container">
//           <i class="icon fa fa-lock"></i>
//           <input type="password" id="signup-password" placeholder="Password" required>
//         </div>
//         <div class="input-container">
//           <i class="icon fa fa-user"></i>
//           <input type="text" id="signup-first-name" placeholder="First Name" required>
//         </div>
//         <button type="submit" class="cta-button">Sign Up</button>
//       </form>
//     </div>
//     <div id="account-container">
//       <h3>Been here before?</h3>
//       <form id="login-form" class="animated-form">
//         <div class="input-container">
//           <i class="icon fa fa-envelope"></i>
//           <input type="email" id="login-email" placeholder="Email" required>
//         </div>
//         <div class="input-container">
//           <i class="icon fa fa-lock"></i>
//           <input type="password" id="login-password" placeholder="Password" required>
//         </div>
//         <button type="submit" class="cta-button">Log In</button>
//       </form>
//       <p id="login-error-message" class="error-message" style="display: none;"></p>
//       <p>
//         <button id="forgot-password-button" class="link-button" type="button">Forgot My Password</button>
//       </p>
//     </div>
//     <div id="account-container">
//       <h3>Too busy for any of that?</h3>
//       <p>
//         <button id="guest-button" class="cta-button guest-button" type="button">Continue as Guest</button>
//       </p>
//     </div>
//   `;
//     // Attach form event listeners


//     document.getElementById('signup-form').addEventListener('submit', (e) => {
//     e.preventDefault();
//     const firstName = document.getElementById('signup-first-name').value;
//     const email = document.getElementById('signup-email').value;
//     const password = document.getElementById('signup-password').value;

//     auth.createUserWithEmailAndPassword(email, password)
//         .then((userCredential) => {
//         const user = userCredential.user;

//         // Send user data to your backend
//         fetch(`${API_BASE_URL}/signup`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//             firebaseUid: user.uid,
//             email: user.email,
//             firstName: firstName,
//             }),
//         })
//             .then((response) => response.json())
//             .then((data) => console.log('User added to database:', data))
//             .catch((error) => console.error('Error adding user to database:', error));
//         })
//         .catch((error) => {
//         console.error('Error signing up:', error.message);
//         });
//     });
    
//     document.getElementById('login-form').addEventListener('submit', (e) => {
//         e.preventDefault();
//         const email = document.getElementById('login-email').value;
//         const password = document.getElementById('login-password').value;
//         const errorMessageElement = document.getElementById('login-error-message');
    
//         auth.signInWithEmailAndPassword(email, password)
//         .then((userCredential) => {
//             // Clear any previous error messages
//             errorMessageElement.style.display = 'none';
//             console.log('User logged in:', userCredential.user);
//         })
//         .catch((error) => {
//             // Display error message
//             errorMessageElement.style.display = 'block';
//             errorMessageElement.textContent = getFriendlyErrorMessage(error.code);
//             console.error('Error logging in:', error.message);
//         });
//     });

//     document.getElementById('guest-button').addEventListener('click', () => {
//         accountContent.innerHTML = `<h2>Welcome, Guest!</h2>`;
//     });
    
//     document.getElementById('forgot-password-button').addEventListener('click', () => {
//         const email = document.getElementById('login-email').value;
    
//         if (!email) {
//         alert('Please enter your email address to reset your password.');
//         return;
//         }
    
//         auth.sendPasswordResetEmail(email)
//         .then(() => {
//             alert('Password reset email sent. Please check your inbox.');
//         })
//         .catch((error) => {
//             console.error('Error sending password reset email:', error.message);
//             alert(`Error: ${error.message}`);
//         });
//     });
//     // Function to return user-friendly error messages
//     function getFriendlyErrorMessage(errorCode) {
//         switch (errorCode) {
//         case 'auth/invalid-email':
//             return 'Invalid email address format.';
//         case 'auth/user-not-found':
//             return 'No account found with this email. Please sign up.';
//         case 'auth/wrong-password':
//             return 'Incorrect password. Please try again.';
//         case 'auth/too-many-requests':
//             return 'Too many failed attempts. Please try again later.';
//         default:
//             return 'Incorrect email or password.';
//         }
//     }

//     }
// });
