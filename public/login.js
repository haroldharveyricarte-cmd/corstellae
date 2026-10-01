function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const authMessage = document.getElementById('auth-message');

  if (authMessage) authMessage.style.display = 'none';

  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
  }
}

// Handle Login Submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const authMessage = document.getElementById('auth-message');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Save user profile info for local UI rendering while the token stays safe in an HttpOnly cookie
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      authMessage.className = 'message-box error';
      authMessage.textContent = data.message || 'Invalid login credentials.';
      authMessage.style.display = 'block';
    }
  } catch (error) {
    authMessage.className = 'message-box error';
    authMessage.textContent = 'Server connection error. Please try again later.';
    authMessage.style.display = 'block';
  }
});

// Handle Sign-Up Submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const nickname = document.getElementById('reg-nickname').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const authMessage = document.getElementById('auth-message');

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, nickname, email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      alert('Account created successfully!');
      window.location.href = 'index.html';
    } else {
      authMessage.className = 'message-box error';
      authMessage.textContent = data.message || 'Registration failed.';
      authMessage.style.display = 'block';
    }
  } catch (error) {
    authMessage.className = 'message-box error';
    authMessage.textContent = 'Server connection error. Please try again later.';
    authMessage.style.display = 'block';
  }
});