document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial State & Sample Posts Load
  initUserSession();
  setupSidebarControls();
  loadPosts();

  // 2. Profile Photo File Upload Preview Logic
  const fileInput = document.getElementById('profile-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('profile-avatar-preview').src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 3. Save Profile Changes Handler
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = getCurrentUser();
      if (!user) return;

      user.nickname = document.getElementById('profile-nickname').value;
      const newAvatar = document.getElementById('profile-avatar-preview').src;
      if (newAvatar) user.avatar = newAvatar;

      localStorage.setItem('currentUser', JSON.stringify(user));
      alert('Profile updated successfully!');
      document.getElementById('profile-modal').style.display = 'none';
      closeSidebar();
      initUserSession();
      loadPosts();
    });
  }

  // 4. Close Profile Modal Button
  const closeBtn = document.getElementById('close-profile-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('profile-modal').style.display = 'none';
    });
  }
});

// Helper: Get Logged In User
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser')) || null;
}

// Sidebar Event Controls
function setupSidebarControls() {
  const openBtn = document.getElementById('open-sidebar-btn');
  const closeBtn = document.getElementById('close-sidebar-btn');
  const overlay = document.getElementById('sidebar-overlay');

  if (openBtn) openBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.add('active');
  if (overlay) overlay.classList.add('active');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

// Session Initialization for Sidebar UI
// Session Initialization for Sidebar UI
function initUserSession() {
  const userBox = document.getElementById('sidebar-user-box');
  const adminLink = document.getElementById('sidebar-admin-link');
  const footerBox = document.getElementById('sidebar-footer');
  const user = getCurrentUser();

  if (user) {
    const avatarImg = user.avatar || 'https://via.placeholder.com/48';

    if (userBox) {
      userBox.style.display = 'flex';
      userBox.innerHTML = `
        <img src="${avatarImg}" class="sidebar-avatar" alt="Avatar">
        <div class="sidebar-user-details">
          <span class="sidebar-nickname">${escapeHTML(user.nickname || user.username)}</span>
          <a href="profile.html?user=${encodeURIComponent(user.username)}" class="edit-profile-btn" style="text-decoration: none; display: inline-block;">View Profile 👤</a>
        </div>
      `;
    }

    if (user.role === 'admin' && adminLink) {
      adminLink.style.display = 'block';
    }

    if (footerBox) {
      footerBox.innerHTML = `
        <button class="submit-btn" style="background-color: #e74c3c; width: 100%;" onclick="handleLogout()">Log Out</button>
      `;
    }
  } else {
    if (userBox) userBox.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
    if (footerBox) {
      footerBox.innerHTML = `
        <a href="login.html" class="submit-btn text-center" style="display: block; text-decoration: none;">Login / Register</a>
      `;
    }
  }
}

// Server & Local Logout Handler
async function handleLogout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch (err) {
    console.error('Error logging out from server:', err);
  }

  localStorage.removeItem('currentUser');
  closeSidebar();
  window.location.href = 'index.html';
}

window.openProfileModal = function() {
  const user = getCurrentUser();
  if (!user) return;

  const nicknameInput = document.getElementById('profile-nickname');
  const avatarPreview = document.getElementById('profile-avatar-preview');
  const modal = document.getElementById('profile-modal');

  if (nicknameInput) nicknameInput.value = user.nickname || user.username || '';
  if (avatarPreview) avatarPreview.src = user.avatar || 'https://via.placeholder.com/80';
  if (modal) modal.style.display = 'flex';
};

// Post Loading & Rendering Logic
function getStoredPosts() {
  const defaultPosts = [
    {
      id: 1,
      title: "Welcome to CorStellae",
      author: "Admin Gabby",
      authorType: "identified",
      avatar: "https://via.placeholder.com/40",
      date: "Just now",
      content: "Welcome everyone! Feel free to post your thoughts anonymously or with your nickname, and leave comments to support each other.",
      comments: [
        { author: "Starlight", text: "Excited for this platform!" },
        { author: "harold", text: "hi" }
      ]
    }
  ];

  const stored = localStorage.getItem('corstellae_posts');
  if (!stored) {
    localStorage.setItem('corstellae_posts', JSON.stringify(defaultPosts));
    return defaultPosts;
  }
  return JSON.parse(stored);
}

function loadPosts() {
  const container = document.getElementById('posts-container');
  if (!container) return;

  let posts = getStoredPosts();
  const currentUser = getCurrentUser();

  // Sort pinned posts first
  posts.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  container.innerHTML = posts.map(post => {
    const isAnon = post.authorType === 'anonymous';
    const profileLink = isAnon ? '#' : `profile.html?user=${encodeURIComponent(post.author)}`;

    return `
      <article class="post-card ${post.pinned ? 'pinned-card' : ''}" data-id="${post.id}">
        <div class="post-header">
          <div class="author-info">
            <a href="${profileLink}" style="text-decoration: none; display: flex; align-items: center; gap: 8px; color: inherit;">
              <img src="${isAnon ? 'https://via.placeholder.com/40' : (post.avatar || 'https://via.placeholder.com/40')}" class="post-avatar" alt="User">
              <span class="author-badge">${isAnon ? 'Anonymous Student' : escapeHTML(post.author)}</span>
            </a>
          </div>
          <div>
            ${post.pinned ? '<span style="background: #f39c12; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; margin-right: 8px;">📌 Pinned</span>' : ''}
            <span class="post-date">${post.date}</span>
          </div>
        </div>

        <h3 class="post-title">${escapeHTML(post.title || '')}</h3>
        <p class="post-content">${escapeHTML(post.content)}</p>

        <div class="comments-section">
          <h4>Comments (${post.comments ? post.comments.length : 0})</h4>
          
          <div class="comments-list">
            ${post.comments ? post.comments.map(c => `
              <div class="comment-item">
                <a href="profile.html?user=${encodeURIComponent(c.author)}" style="text-decoration: none; color: inherit;">
                  <strong>${escapeHTML(c.author)}:</strong>
                </a>
                <span>${escapeHTML(c.text)}</span>
              </div>
            `).join('') : ''}
          </div>

          <div class="comment-input-box">
            <input type="text" id="comment-input-${post.id}" placeholder="${currentUser ? 'Write a supportive comment...' : 'Log in to comment'}" ${!currentUser ? 'disabled' : ''}>
            <button onclick="addComment(${post.id})" ${!currentUser ? 'disabled' : ''}>Comment</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Route User Comments to Pending Moderation Queue
function addComment(postId) {
  const user = getCurrentUser();
  if (!user) {
    alert('Please log in to add a comment!');
    return;
  }

  const input = document.getElementById(`comment-input-${postId}`);
  const commentText = input.value.trim();
  if (!commentText) return;

  const posts = getStoredPosts();
  const targetPost = posts.find(p => p.id === postId);

  if (targetPost) {
    const pendingComments = JSON.parse(localStorage.getItem('corstellae_pending_comments')) || [];

    const newPendingComment = {
      id: 'cmt_' + Date.now(),
      postId: postId,
      postTitle: targetPost.title || 'Untitled Post',
      author: user.nickname || user.username,
      text: commentText
    };

    pendingComments.push(newPendingComment);
    localStorage.setItem('corstellae_pending_comments', JSON.stringify(pendingComments));

    alert('Your comment has been submitted and is pending admin approval!');
    input.value = '';
  }
}

// XSS Protection Helper
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}