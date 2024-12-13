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
      <h2>Sign Up</h2>
      <form id="signup-form">
        <input type="email" id="signup-email" placeholder="Email" required>
        <input type="password" id="signup-password" placeholder="Password" required>
        <button type="submit">Sign Up</button>
      </form>
      <h2>Log In</h2>
      <form id="login-form">
        <input type="email" id="login-email" placeholder="Email" required>
        <input type="password" id="login-password" placeholder="Password" required>
        <button type="submit">Log In</button>
      </form>
    `;
    // Attach form event listeners
    document.getElementById('signup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;

      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log('User signed up:', userCredential.user);
        })
        .catch((error) => {
          console.error('Error signing up:', error.message);
        });
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log('User logged in:', userCredential.user);
        })
        .catch((error) => {
          console.error('Error logging in:', error.message);
        });
    });
  }
});
