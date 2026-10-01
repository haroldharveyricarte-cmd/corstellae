document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Admin access guard
  if (!currentUser || currentUser.role !== 'admin') {
    alert('Access restricted to Administrators only.');
    window.location.href = 'index.html';
    return;
  }

  loadAdminDashboard();

  // Edit form submit listener
  const editForm = document.getElementById('edit-post-form');
  if (editForm) {
    editForm.addEventListener('submit', handleSaveEditPost);
  }
});

function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));

  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = 'block';

  // Highlight active button
  const activeBtn = Array.from(document.querySelectorAll('.admin-tabs .tab-btn'))
    .find(btn => btn.getAttribute('onclick').includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');
}

function loadAdminDashboard() {
  loadPendingPosts();
  loadPendingComments();
  loadLivePosts();
  loadUsersList();
  updateCounters();
}

function updateCounters() {
  const pendingPosts = JSON.parse(localStorage.getItem('corstellae_pending_posts')) || [];
  const pendingComments = JSON.parse(localStorage.getItem('corstellae_pending_comments')) || [];
  
  document.getElementById('count-pending-posts').textContent = pendingPosts.length;
  document.getElementById('count-pending-comments').textContent = pendingComments.length;
}

/* --- 1. Pending Posts Moderation --- */
function loadPendingPosts() {
  const container = document.getElementById('pending-posts-list');
  if (!container) return;

  const pendingPosts = JSON.parse(localStorage.getItem('corstellae_pending_posts')) || [];

  if (pendingPosts.length === 0) {
    container.innerHTML = `<p class="empty-msg">No pending posts for review.</p>`;
    return;
  }

  container.innerHTML = pendingPosts.map(post => `
    <article class="post-card pending-card">
      <div class="post-header">
        <span class="author-badge">${post.authorType === 'anonymous' ? 'Anonymous' : 'By: ' + escapeHTML(post.author)}</span>
        <span class="status-badge pending">Pending Post</span>
      </div>
      <h3 class="post-title">${escapeHTML(post.title)}</h3>
      <p class="post-content">${escapeHTML(post.content)}</p>

      <div class="admin-actions">
        <button class="btn btn-approve" onclick="approvePost(${post.id})">Approve & Publish</button>
        <button class="btn btn-reject" onclick="rejectPost(${post.id})">Reject Post</button>
      </div>
    </article>
  `).join('');
}

function approvePost(postId) {
  let pendingPosts = JSON.parse(localStorage.getItem('corstellae_pending_posts')) || [];
  const approvedPosts = JSON.parse(localStorage.getItem('corstellae_posts')) || [];

  const postToApprove = pendingPosts.find(p => p.id === postId);
  if (postToApprove) {
    postToApprove.status = 'approved';
    approvedPosts.unshift(postToApprove);

    pendingPosts = pendingPosts.filter(p => p.id !== postId);
    localStorage.setItem('corstellae_posts', JSON.stringify(approvedPosts));
    localStorage.setItem('corstellae_pending_posts', JSON.stringify(pendingPosts));

    loadAdminDashboard();
  }
}

function rejectPost(postId) {
  let pendingPosts = JSON.parse(localStorage.getItem('corstellae_pending_posts')) || [];
  pendingPosts = pendingPosts.filter(p => p.id !== postId);
  localStorage.setItem('corstellae_pending_posts', JSON.stringify(pendingPosts));

  loadAdminDashboard();
}

/* --- 2. Pending Comments Moderation --- */
function loadPendingComments() {
  const container = document.getElementById('pending-comments-list');
  if (!container) return;

  const pendingComments = JSON.parse(localStorage.getItem('corstellae_pending_comments')) || [];

  if (pendingComments.length === 0) {
    container.innerHTML = `<p class="empty-msg">No pending comments for review.</p>`;
    return;
  }

  container.innerHTML = pendingComments.map(c => `
    <div class="post-card pending-card">
      <p><strong>Post Title:</strong> ${escapeHTML(c.postTitle)}</p>
      <p><strong>Commenter:</strong> ${escapeHTML(c.author)}</p>
      <blockquote class="comment-quote">${escapeHTML(c.text)}</blockquote>
      
      <div class="admin-actions">
        <button class="btn btn-approve" onclick="approveComment('${c.id}')">Approve Comment</button>
        <button class="btn btn-reject" onclick="rejectComment('${c.id}')">Reject Comment</button>
      </div>
    </div>
  `).join('');
}

function approveComment(commentId) {
  let pendingComments = JSON.parse(localStorage.getItem('corstellae_pending_comments')) || [];
  const posts = JSON.parse(localStorage.getItem('corstellae_posts')) || [];

  const commentToApprove = pendingComments.find(c => c.id === commentId);
  if (commentToApprove) {
    const targetPost = posts.find(p => p.id === commentToApprove.postId);
    if (targetPost) {
      if (!targetPost.comments) targetPost.comments = [];
      targetPost.comments.push({ author: commentToApprove.author, text: commentToApprove.text });
      localStorage.setItem('corstellae_posts', JSON.stringify(posts));
    }

    pendingComments = pendingComments.filter(c => c.id !== commentId);
    localStorage.setItem('corstellae_pending_comments', JSON.stringify(pendingComments));
    loadAdminDashboard();
  }
}

function rejectComment(commentId) {
  let pendingComments = JSON.parse(localStorage.getItem('corstellae_pending_comments')) || [];
  pendingComments = pendingComments.filter(c => c.id !== commentId);
  localStorage.setItem('corstellae_pending_comments', JSON.stringify(pendingComments));
  loadAdminDashboard();
}

/* --- 3. Manage Live Posts (Edit / Delete) --- */
/* --- 3. Manage Live Posts (Edit / Delete / Pin) --- */
function loadLivePosts() {
  const container = document.getElementById('live-posts-list');
  if (!container) return;

  const posts = JSON.parse(localStorage.getItem('corstellae_posts')) || [];

  if (posts.length === 0) {
    container.innerHTML = `<p class="empty-msg">No live posts found.</p>`;
    return;
  }

  container.innerHTML = posts.map(post => `
    <article class="post-card ${post.pinned ? 'pinned-post' : ''}">
      <div class="post-header">
        <span class="author-badge">Author: ${escapeHTML(post.author)}</span>
        <div>
          ${post.pinned ? '<span class="badge admin" style="background:#f39c12; margin-right: 8px;">📌 Pinned</span>' : ''}
          <span class="post-date">${post.date}</span>
        </div>
      </div>
      <h3 class="post-title">${escapeHTML(post.title)}</h3>
      <p class="post-content">${escapeHTML(post.content)}</p>

      <div class="admin-actions">
        <button class="btn" style="background: ${post.pinned ? '#7f8c8d' : '#f39c12'}; color: white;" onclick="togglePinPost(${post.id})">
          ${post.pinned ? '📌 Unpin Post' : '📌 Pin to Top'}
        </button>
        <button class="btn btn-edit" onclick="openEditModal(${post.id})">✏️ Edit</button>
        <button class="btn btn-delete" onclick="deleteLivePost(${post.id})">🗑️ Delete</button>
      </div>
    </article>
  `).join('');
}

// Function to Pin or Unpin a Post
function togglePinPost(postId) {
  const posts = JSON.parse(localStorage.getItem('corstellae_posts')) || [];
  const post = posts.find(p => p.id === postId);

  if (post) {
    post.pinned = !post.pinned; // Toggle pin status
    localStorage.setItem('corstellae_posts', JSON.stringify(posts));
    loadAdminDashboard();
  }
}

function openEditModal(postId) {
  const posts = JSON.parse(localStorage.getItem('corstellae_posts')) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  document.getElementById('edit-post-id').value = post.id;
  document.getElementById('edit-post-title').value = post.title;
  document.getElementById('edit-post-content').value = post.content;
  document.getElementById('edit-post-modal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('edit-post-modal').style.display = 'none';
}

function handleSaveEditPost(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('edit-post-id').value);
  const title = document.getElementById('edit-post-title').value.trim();
  const content = document.getElementById('edit-post-content').value.trim();

  const posts = JSON.parse(localStorage.getItem('corstellae_posts')) || [];
  const post = posts.find(p => p.id === id);

  if (post) {
    post.title = title;
    post.content = content;
    localStorage.setItem('corstellae_posts', JSON.stringify(posts));
    closeEditModal();
    loadAdminDashboard();
  }
}

function deleteLivePost(postId) {
  if (!confirm('Are you sure you want to permanently delete this live post?')) return;

  let posts = JSON.parse(localStorage.getItem('corstellae_posts')) || [];
  posts = posts.filter(p => p.id !== postId);
  localStorage.setItem('corstellae_posts', JSON.stringify(posts));
  loadAdminDashboard();
}

/* --- 4. Users List --- */
function loadUsersList() {
  const container = document.getElementById('users-list');
  if (!container) return;

  // Retrieve stored users or show current logged in accounts
  const registeredUsers = JSON.parse(localStorage.getItem('corstellae_registered_users')) || [
    { username: 'gabbythecreator', nickname: 'Gabby (Creator)', role: 'admin' }
  ];

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Nickname</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        ${registeredUsers.map(u => `
          <tr>
            <td><strong>${escapeHTML(u.username)}</strong></td>
            <td>${escapeHTML(u.nickname || u.username)}</td>
            <td><span class="badge ${u.role === 'admin' ? 'admin' : 'student'}">${u.role}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}