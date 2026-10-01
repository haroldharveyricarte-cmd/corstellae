document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserParam = urlParams.get('user');
  const currentUser = getCurrentUser();

  const targetUsername = targetUserParam || (currentUser ? currentUser.username : null);

  if (!targetUsername) {
    alert('Please log in or select a valid user to view profile.');
    window.location.href = 'index.html';
    return;
  }

  loadProfile(targetUsername);

  // Avatar File Preview
  const avatarFile = document.getElementById('edit-avatar-file');
  if (avatarFile) {
    avatarFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('edit-preview-avatar').src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Cover Photo File Preview
  const coverFile = document.getElementById('edit-cover-file');
  if (coverFile) {
    coverFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('edit-preview-cover').src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Edit Form Save
  const editForm = document.getElementById('page-profile-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentUser) return;

      currentUser.nickname = document.getElementById('edit-nickname-input').value.trim();
      currentUser.bio = document.getElementById('edit-bio-input').value.trim();
      currentUser.avatar = document.getElementById('edit-preview-avatar').src;
      currentUser.cover = document.getElementById('edit-preview-cover').src;

      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      alert('Profile updated successfully!');
      closeEditProfileModal();
      initUserSession();
      loadProfile(currentUser.username);
    });
  }

  // Message Form Handler
  const msgForm = document.getElementById('send-msg-form');
  if (msgForm) {
    msgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msgText = document.getElementById('msg-text-input').value.trim();
      if (!msgText) return;

      alert(`Message sent to ${targetUsername}!`);
      document.getElementById('msg-text-input').value = '';
      closeMessageModal();
    });
  }
});

function loadProfile(username) {
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser && (
    currentUser.username.toLowerCase() === username.toLowerCase() ||
    (currentUser.nickname && currentUser.nickname.toLowerCase() === username.toLowerCase())
  );

  const nicknameEl = document.getElementById('view-nickname');
  const usernameEl = document.getElementById('view-username');
  const bioEl = document.getElementById('view-bio');
  const avatarEl = document.getElementById('view-avatar');
  const coverEl = document.getElementById('view-cover');
  const actionsEl = document.getElementById('profile-actions');

  if (isOwnProfile) {
    nicknameEl.textContent = currentUser.nickname || currentUser.username;
    usernameEl.textContent = `@${currentUser.username}`;
    bioEl.textContent = currentUser.bio || 'No bio provided yet. Click "Edit Profile" to add one!';
    avatarEl.src = currentUser.avatar || 'https://via.placeholder.com/100';

    if (currentUser.cover) {
      coverEl.style.backgroundImage = `url('${currentUser.cover}')`;
      coverEl.style.backgroundSize = 'cover';
      coverEl.style.backgroundPosition = 'center';
    }

    // Show Edit Profile button ONLY if logged in user views their OWN profile
    actionsEl.innerHTML = `
      <button class="btn btn-edit" onclick="openEditProfileModal()">✏️ Edit Profile</button>
    `;
  } else {
    // Public profile view for other students
    nicknameEl.textContent = username;
    usernameEl.textContent = `@${username.toLowerCase().replace(/\s+/g, '')}`;
    bioEl.textContent = 'Student on CorStellae';
    avatarEl.src = 'https://via.placeholder.com/100';

    // Show Message button ONLY when viewing someone else
    actionsEl.innerHTML = `
      <button class="btn" style="background:#3498db; color:white;" onclick="openMessageModal('${escapeHTML(username)}')">💬 Send Message</button>
    `;
  }

  loadUserPosts(username);
}

function loadUserPosts(authorName) {
  const container = document.getElementById('user-posts-container');
  if (!container) return;

  const allPosts = JSON.parse(localStorage.getItem('corstellae_posts')) || [];
  const userPosts = allPosts.filter(p => p.author.toLowerCase() === authorName.toLowerCase() && p.authorType !== 'anonymous');

  if (userPosts.length === 0) {
    container.innerHTML = `<p class="empty-msg">No public stories posted by ${escapeHTML(authorName)} yet.</p>`;
    return;
  }

  container.innerHTML = userPosts.map(post => `
    <article class="post-card">
      <div class="post-header">
        <span class="author-badge">${escapeHTML(post.author)}</span>
        <span class="post-date">${post.date}</span>
      </div>
      <h3 class="post-title">${escapeHTML(post.title)}</h3>
      <p class="post-content">${escapeHTML(post.content)}</p>
    </article>
  `).join('');
}

function openEditProfileModal() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  document.getElementById('edit-nickname-input').value = currentUser.nickname || currentUser.username;
  document.getElementById('edit-bio-input').value = currentUser.bio || '';
  document.getElementById('edit-preview-avatar').src = currentUser.avatar || 'https://via.placeholder.com/80';
  document.getElementById('edit-preview-cover').src = currentUser.cover || 'https://via.placeholder.com/300x100';
  document.getElementById('edit-profile-page-modal').style.display = 'flex';
}

function closeEditProfileModal() {
  document.getElementById('edit-profile-page-modal').style.display = 'none';
}

function openMessageModal(username) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please log in to send messages.');
    return;
  }
  document.getElementById('msg-modal-title').textContent = `Send Message to ${username}`;
  document.getElementById('message-modal').style.display = 'flex';
}

function closeMessageModal() {
  document.getElementById('message-modal').style.display = 'none';
}