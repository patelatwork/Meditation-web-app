document.addEventListener('DOMContentLoaded', function() {
  const isLoginPage = window.location.pathname.includes('login');
  const form = isLoginPage ? document.getElementById('login-form') : document.getElementById('signup-form');
  const errorMessage = document.getElementById('error-message');
  
  // Check if already logged in
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/meditation/history');
      if (response.ok) {
        // User is already logged in, redirect to app
        window.location.href = '/app';
      }
    } catch (error) {
      // Not logged in, continue with the page
    }
  };
  
  checkAuth();
  
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Reset error message
      errorMessage.textContent = '';
      
      if (isLoginPage) {
        // Login handling
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
       // Login handling
try {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Only redirect to app page after successful login
    window.location.href = '/app';
  } else {
    errorMessage.textContent = data.message || 'Invalid credentials';
  }
} catch (error) {
  console.error('Login error:', error);
  errorMessage.textContent = 'An error occurred. Please try again.';
}
      } else {
        // Signup handling
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
          errorMessage.textContent = 'Passwords do not match';
          return;
        }
       // Signup handling
try {
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Redirect to login page after successful signup
    window.location.href = '/login?message=signup_success';
  } else {
    errorMessage.textContent = data.message;
  }
} catch (error) {
  console.error('Signup error:', error);
  errorMessage.textContent = 'An error occurred. Please try again.';
}
      }
    });
  }

  // Check for signup success message
  if (isLoginPage) {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'signup_success') {
      errorMessage.style.color = 'var(--success-color)';
      errorMessage.textContent = 'Signup successful! Please login.';
    }
  }
});