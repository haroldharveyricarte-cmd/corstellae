document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // 1. Force Login Check
  if (!currentUser) {
    alert('Please log in first to share a story!');
    window.location.href = 'login.html';
    return;
  }

  // 2. Set Nickname Preview in Radio Option
  const previewSpan = document.getElementById('user-display-preview');
  if (previewSpan) {
    previewSpan.textContent = currentUser.nickname || currentUser.username;
  }

  // 3. Handle Form Submission
  const form = document.getElementById('submit-post-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const authorType = document.querySelector('input[name="authorType"]:checked').value;

    const newPost = {
      id: Date.now(),
      title: title,
      content: content,
      author: currentUser.nickname || currentUser.username,
      authorType: authorType,
      avatar: currentUser.avatar || 'https://via.placeholder.com/40',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending', // Pending Admin Approval
      comments: []
    };

    // Save to Pending Posts Storage
    const pendingPosts = JSON.parse(localStorage.getItem('corstellae_pending_posts')) || [];
    pendingPosts.push(newPost);
    localStorage.setItem('corstellae_pending_posts', JSON.stringify(pendingPosts));

    // Show Success Message
    const msgBox = document.getElementById('form-message');
    msgBox.className = 'message-box success';
    msgBox.textContent = 'Your story has been submitted! It will appear on the homepage once approved by an admin.';
    msgBox.style.display = 'block';

    form.reset();
    if (previewSpan) previewSpan.textContent = currentUser.nickname || currentUser.username;
  });
});