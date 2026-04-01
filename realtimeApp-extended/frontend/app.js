const API = 'http://localhost:3000/api';
const STATIC_MODE = false;
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let socket = null;
let followingSet = new Set();

// ===================== MOBILE PANELS =====================
function toggleMobileLeft() {
  document.getElementById('left-panel').classList.toggle('open');
  document.getElementById('left-overlay').classList.toggle('visible');
  document.getElementById('right-panel')?.classList.remove('open');
  document.getElementById('right-overlay').classList.remove('visible');
}

function toggleMobileRight() {
  document.getElementById('right-panel').classList.toggle('open');
  document.getElementById('right-overlay').classList.toggle('visible');
  document.getElementById('left-panel').classList.remove('open');
  document.getElementById('left-overlay').classList.remove('visible');
}

function closeMobilePanels() {
  document.getElementById('left-panel').classList.remove('open');
  document.getElementById('right-panel').classList.remove('open');
  document.getElementById('left-overlay').classList.remove('visible');
  document.getElementById('right-overlay').classList.remove('visible');
}

// kept for backward compat
function toggleSidebar() { toggleMobileLeft(); }
function closeSidebar() { closeMobilePanels(); }

// ===================== DARK MODE =====================
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark ? '1' : '0');
  syncDarkToggleBtn(isDark);
}

function syncDarkToggleBtn(isDark) {
  const btn = document.getElementById('dark-toggle-btn');
  if (!btn) return;
  btn.innerHTML = isDark
    ? '<span>☀️</span><span class="side-nav-label">Light mode</span>'
    : '<span>🌙</span><span class="side-nav-label">Dark mode</span>';
}

// Apply saved dark mode preference on load
if (localStorage.getItem('darkMode') === '1') {
  document.body.classList.add('dark');
  document.addEventListener('DOMContentLoaded', () => syncDarkToggleBtn(true));
}


// Static mock users for the sidebar
const MOCK_USERS = [
  { username: 'alice', followersCount: 3 },
  { username: 'bob', followersCount: 1 },
  { username: 'carol', followersCount: 5 },
];

// Per-user reaction tracking: { [commentId]: 'like' | 'dislike' | null }
const userReactions = {};

// In-memory comments store
let mockComments = [
  { _id: 'c001', content: 'Hey everyone, welcome to the chat!', author: { _id: 'user2', username: 'alice' }, createdAt: new Date(Date.now() - 3600000).toISOString(), likesCount: 2, dislikesCount: 0, parentCommentId: null },
  { _id: 'c002', content: 'Glad to be here 👋', author: { _id: 'user3', username: 'bob' }, createdAt: new Date(Date.now() - 1800000).toISOString(), likesCount: 1, dislikesCount: 0, parentCommentId: null },
  { _id: 'c003', content: 'This UI looks great!', author: { _id: 'user4', username: 'carol' }, createdAt: new Date(Date.now() - 600000).toISOString(), likesCount: 0, dislikesCount: 0, parentCommentId: null },
];

// ===================== TOAST (Tippy.js) =====================
const _toastAnchor = (() => {
  const el = document.createElement('div');
  el.id = '_toast-anchor';
  el.style.cssText = 'position:fixed;top:20px;right:20px;width:1px;height:1px;z-index:9999;pointer-events:none;';
  document.body.appendChild(el);
  return el;
})();

function toast(title, msg = '', type = 'info') {
  const icons = { info: '💬', success: '✅', warning: '⚠️', error: '❌', like: '❤️', reply: '↩️', comment: '💬' };
  const colors = { info: '#7c6af7', success: '#4caf7d', warning: '#f0a500', error: '#e05555', like: '#e05555', reply: '#7c6af7', comment: '#7c6af7' };
  const content = `
    <div style="display:flex;align-items:flex-start;gap:10px;min-width:240px;max-width:320px;">
      <span style="font-size:18px">${icons[type] || icons.info}</span>
      <div>
        <div style="font-weight:600;font-size:14px;color:#f1f5f9">${title}</div>
        ${msg ? `<div style="font-size:13px;color:#94a3b8;margin-top:2px">${msg}</div>` : ''}
      </div>
    </div>`;

  const instance = tippy(_toastAnchor, {
    content,
    allowHTML: true,
    placement: 'bottom-end',
    trigger: 'manual',
    hideOnClick: false,
    arrow: false,
    theme: 'toast',
    duration: [300, 200],
    onShown(i) { setTimeout(() => i.hide(), 4000); },
    onHidden(i) { i.destroy(); },
  });
  instance.show();
}

// ===================== AUTH =====================
function switchTab(tab) {
  event.target.classList.add('active');
  document.querySelectorAll('.tab').forEach(t => {
    if (t !== event.target) t.classList.remove('active');
  });
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

function switchTabByName(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

async function handleLogin(e) {
  e.preventDefault();

  if (STATIC_MODE) {
    const username = document.getElementById('login-email').value.split('@')[0];

    // ❌ removed _id: 'user1'
    saveSession({
      token: 'static-token',
      user: { username, email: document.getElementById('login-email').value, isAdmin: false }
    });

    toast('Welcome!', `Logged in as ${username}`, 'success');
    initApp();
    return;
  }

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');

    saveSession(data);
    toast('Welcome back!', `Logged in as ${data.user.username}`, 'success');
    initApp();
  } catch (err) {
    toast('Login failed', err.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();

  if (STATIC_MODE) {
    const username = document.getElementById('reg-username').value;

    // ❌ removed _id: 'user1'
    saveSession({
      token: 'static-token',
      user: { username, email: document.getElementById('reg-email').value, isAdmin: false }
    });

    toast('Account created!', `Welcome, ${username}`, 'success');
    initApp();
    return;
  }

  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Registration failed');

    toast('Account created!', 'Please log in to continue', 'success');

    document.getElementById('reg-username').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';

    switchTabByName('login');
  } catch (err) {
    toast('Registration failed', err.message, 'error');
  }
}

function saveSession(data) {
  token = data.token;
  currentUser = data.user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(currentUser));
}

function logout() {
  localStorage.clear();
  token = null;
  currentUser = null;
  if (socket) { socket.disconnect(); socket = null; }
  // Clear login form fields
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('app-section').classList.add('hidden');
  document.getElementById('auth-section').classList.remove('hidden');
  switchTabByName('login');
  toast('Logged out', '', 'info');
}

// ===================== INIT =====================
async function initApp() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('app-section').classList.remove('hidden');

  document.getElementById('nav-username').textContent = currentUser.username;
  const url = avatarUrl(currentUser);
  document.getElementById('nav-avatar').src = url;
  document.getElementById('feed-avatar').src = url;

  // Sync dark toggle icon
  syncDarkToggleBtn(document.body.classList.contains('dark'));

  if (currentUser.isAdmin) {
    document.getElementById('admin-btn').classList.remove('hidden');
  }

  await loadUsers();
  await loadComments();
  await loadNotifications();
  connectSocket();
}

function showLoginNotifications() {
  // removed — replaced by real-time notifications
}

function connectSocket() {
  if (STATIC_MODE) return;

  if (!currentUser?._id) {
    console.warn("Socket skipped: no valid user id");
    return;
  }

  socket = io('http://localhost:3000');

  socket.on('connect', () => {
    socket.emit('register', currentUser._id);
  });

  // New comment or reply posted by anyone
  socket.on('new_comment', ({ comment }) => {
    prependComment(comment);
  });

  // Someone replied to your comment
  socket.on('new_reply', ({ notification }) => {
    addNotifItem(notification);
    incrementBadge();
    toast('New Reply', notification.message, 'info');
  });

  // Someone liked your comment
  socket.on('new_like', ({ notification }) => {
    addNotifItem(notification);
    incrementBadge();
    toast('New Like', notification.message, 'info');
  });

  // Someone followed you
  socket.on('new_follower', ({ notification }) => {
    addNotifItem(notification);
    incrementBadge();
    toast('New Follower', notification.message, 'info');
  });
}

// ===================== COMMENTS =====================
async function loadComments() {
  if (STATIC_MODE) {
    const feed = document.getElementById('comments-feed');
    feed.innerHTML = '';
    if (!mockComments.length) {
      feed.innerHTML = '<div class="empty-state">No comments yet. Be the first! 🎉</div>';
      return;
    }
    mockComments.filter(c => !c.parentCommentId).forEach(c => feed.appendChild(buildCommentCard(c, false)));
    mockComments.filter(c => !!c.parentCommentId).forEach(c => {
      const parentCard = feed.querySelector(`[data-comment-id="${c.parentCommentId}"]`);
      const card = buildCommentCard(c, true);
      if (parentCard) parentCard.after(card);
      else feed.appendChild(card);
    });
    return;
  }
  const res = await fetch(`${API}/comments`);
  const comments = await res.json();
  const feed = document.getElementById('comments-feed');
  feed.innerHTML = '';
  if (!comments.length) {
    feed.innerHTML = '<div class="empty-state">No comments yet. Be the first! 🎉</div>';
    return;
  }
  const topLevel = comments.filter(c => !c.parentCommentId);
  const replies = comments.filter(c => !!c.parentCommentId);
  topLevel.forEach(c => feed.appendChild(buildCommentCard(c, false)));
  replies.forEach(c => {
    const parentId = c.parentCommentId?._id || c.parentCommentId;
    const parentCard = feed.querySelector(`[data-comment-id="${parentId}"]`);
    const card = buildCommentCard(c, true);
    if (parentCard) {
      let last = parentCard;
      while (last.nextSibling && last.nextSibling.classList?.contains('reply-card')) last = last.nextSibling;
      last.after(card);
    } else {
      feed.appendChild(card);
    }
  });
}

function prependComment(comment) {
  const feed = document.getElementById('comments-feed');
  const empty = feed.querySelector('.empty-state');
  if (empty) empty.remove();
  const isReply = !!comment.parentCommentId;
  const card = buildCommentCard(comment, isReply);
  if (isReply) {
    // Insert reply after its parent card if visible
    const parentCard = feed.querySelector(`[data-comment-id="${comment.parentCommentId?._id || comment.parentCommentId}"]`);
    if (parentCard) {
      parentCard.after(card);
      return;
    }
  }
  feed.insertBefore(card, feed.firstChild);
}

function buildCommentCard(c, isReply = false) {
  const div = document.createElement('div');
  const isOwner = currentUser && currentUser._id && c.author?._id === currentUser._id;
  const ownerClass = isOwner ? 'own-comment' : 'other-comment';
  div.className = isReply ? `comment-card reply-card ${ownerClass}` : `comment-card ${ownerClass}`;
  div.dataset.commentId = c._id;

  if (!c.author) c.author = { _id: '', username: 'Unknown', profilePicture: '' };
  const avatarSrc = avatarUrl(c.author);
  const replyLabel = c.parentCommentId ? `<span class="reply-label">↩️ replying to @${c.parentCommentId?.author?.username || '...'}</span>` : '';

  div.innerHTML = `
    <div class="comment-header">
      <img src="${avatarSrc}" class="avatar-sm" />
      <span class="comment-author">${c.author.username}</span>
      <span class="comment-time">${timeAgo(c.createdAt)}</span>
      ${replyLabel}
    </div>
    <div class="comment-content">${escHtml(c.content)}</div>
    <div class="comment-actions">
      <button class="action-btn like-btn" onclick="toggleLike('${c._id}', 'like', this)">
        👍 <span class="like-count">${c.likesCount || 0}</span>
      </button>
      <button class="action-btn dislike-btn" onclick="toggleLike('${c._id}', 'dislike', this)">
        👎 <span class="dislike-count">${c.dislikesCount || 0}</span>
      </button>
      ${currentUser ? `<button class="action-btn reply-btn" onclick="showReplyBox('${c._id}', '${escHtml(c.author.username)}', this)">↩️ Reply</button>` : ''}
      ${isOwner ? `<button class="action-btn delete-btn" onclick="deleteComment('${c._id}', this)">🗑️ Delete</button>` : ''}
    </div>
    <div class="reply-box hidden" id="reply-box-${c._id}">
      <textarea class="reply-input" placeholder="Reply to ${escHtml(c.author.username)}..." rows="2"></textarea>
      <div class="reply-box-actions">
        <button class="btn-primary btn-sm" onclick="submitReply('${c._id}', this)">Reply</button>
        <button class="btn-secondary btn-sm" onclick="hideReplyBox('${c._id}')">Cancel</button>
      </div>
    </div>
  `;
  return div;
}

function showReplyBox(commentId, username, btn) {
  // Hide all other reply boxes
  document.querySelectorAll('.reply-box').forEach(b => b.classList.add('hidden'));
  const box = document.getElementById(`reply-box-${commentId}`);
  box.classList.remove('hidden');
  box.querySelector('.reply-input').focus();
}

function hideReplyBox(commentId) {
  document.getElementById(`reply-box-${commentId}`).classList.add('hidden');
}

async function submitReply(parentCommentId, btn) {
  const box = document.getElementById(`reply-box-${parentCommentId}`);
  const input = box.querySelector('.reply-input');
  const content = input.value.trim();
  if (!content) return;
  if (STATIC_MODE) {
    const parent = mockComments.find(c => c._id === parentCommentId);
    const reply = {
      _id: 'c' + Date.now(),
      content,
      author: { _id: currentUser._id, username: currentUser.username },
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
      parentCommentId: { _id: parentCommentId, author: parent?.author },
    };
    mockComments.push(reply);
    input.value = '';
    box.classList.add('hidden');
    prependComment(reply);
    return;
  }
  try {
    const res = await authFetch(`${API}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    input.value = '';
    box.classList.add('hidden');
  } catch (err) {
    toast('Error', err.message, 'error');
  }
}

async function toggleLike(commentId, type, btn) {
  if (!currentUser) { toast('Login required', 'Please log in to react', 'warning'); return; }

  if (STATIC_MODE) {
    const comment = mockComments.find(c => c._id === commentId);
    if (!comment) return;

    const prev = userReactions[commentId] || null;
    const card = btn.closest('.comment-card');
    const likeBtn = card.querySelector('.like-btn');
    const dislikeBtn = card.querySelector('.dislike-btn');

    if (prev === type) {
      // Toggle off
      if (type === 'like') comment.likesCount = Math.max(0, (comment.likesCount || 0) - 1);
      else comment.dislikesCount = Math.max(0, (comment.dislikesCount || 0) - 1);
      userReactions[commentId] = null;
      likeBtn.classList.remove('active');
      dislikeBtn.classList.remove('active');
    } else {
      // Switch or new reaction
      if (prev === 'like') comment.likesCount = Math.max(0, (comment.likesCount || 0) - 1);
      if (prev === 'dislike') comment.dislikesCount = Math.max(0, (comment.dislikesCount || 0) - 1);
      if (type === 'like') comment.likesCount = (comment.likesCount || 0) + 1;
      else comment.dislikesCount = (comment.dislikesCount || 0) + 1;
      userReactions[commentId] = type;
      likeBtn.classList.toggle('active', type === 'like');
      dislikeBtn.classList.toggle('active', type === 'dislike');
    }

    likeBtn.querySelector('.like-count').textContent = comment.likesCount || 0;
    dislikeBtn.querySelector('.dislike-count').textContent = comment.dislikesCount || 0;
    return;
  }

  try {
    const res = await authFetch(`${API}/likes/${commentId}`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const card = btn.closest('.comment-card');
    const likeBtn = card.querySelector('.like-btn');
    const dislikeBtn = card.querySelector('.dislike-btn');

    // Update active state based on server response
    if (data.action === 'removed') {
      likeBtn.classList.remove('active');
      dislikeBtn.classList.remove('active');
      userReactions[commentId] = null;
    } else {
      likeBtn.classList.toggle('active', data.type === 'like');
      dislikeBtn.classList.toggle('active', data.type === 'dislike');
      userReactions[commentId] = data.type;
    }

    // Fetch updated counts for just this comment
    const cRes = await fetch(`${API}/comments`);
    const comments = await cRes.json();
    const updated = comments.find(c => c._id === commentId);
    if (updated) {
      likeBtn.querySelector('.like-count').textContent = updated.likesCount || 0;
      dislikeBtn.querySelector('.dislike-count').textContent = updated.dislikesCount || 0;
    }
  } catch (err) {
    toast('Error', err.message, 'error');
  }
}

async function postComment() {
  const input = document.getElementById('comment-input');
  const content = input.value.trim();
  if (!content) return;
  if (STATIC_MODE) {
    const comment = {
      _id: 'c' + Date.now(),
      content,
      author: { _id: currentUser._id, username: currentUser.username },
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
      parentCommentId: null,
    };
    mockComments.unshift(comment);
    input.value = '';
    prependComment(comment);
    return;
  }
  try {
    const res = await authFetch(`${API}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    input.value = '';
  } catch (err) {
    toast('Error', err.message, 'error');
  }
}

async function deleteComment(id, btn) {
  if (STATIC_MODE) {
    mockComments = mockComments.filter(c => c._id !== id);
    btn.closest('.comment-card').remove();
    toast('Deleted', 'Comment removed', 'success');
    return;
  }
  try {
    const res = await authFetch(`${API}/comments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    btn.closest('.comment-card').remove();
    toast('Deleted', 'Comment removed', 'success');
  } catch (err) {
    toast('Error', err.message, 'error');
  }
}

// ===================== USERS =====================
async function loadUsers() {
  if (STATIC_MODE) {
    const list = document.getElementById('users-list');
    list.innerHTML = '';
    MOCK_USERS.forEach(u => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.innerHTML = `
        <img src="https://api.dicebear.com/7.x/lorelei/svg?seed=${u.username}" class="avatar-sm" />
        <div>
          <div class="name">${u.username}</div>
          <div class="meta">${u.followersCount} followers</div>
        </div>
        <button class="follow-btn" onclick="toggleFollow('${u._id}', this)">Follow</button>
      `;
      list.appendChild(div);
    });
    return;
  }
  const res = await fetch(`${API}/users`);
  const users = await res.json();
  if (token) {
    try {
      const fRes = await authFetch(`${API}/followers/${currentUser._id}/following`);
      const following = await fRes.json();
      followingSet = new Set(following.map(f => f.following?._id || f.following));
    } catch {}
  }
  const list = document.getElementById('users-list');
  list.innerHTML = '';
  users.filter(u => u._id !== currentUser._id).forEach(u => {
    const isFollowing = followingSet.has(u._id);
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `
      <img src="${avatarUrl(u)}" class="avatar-sm" />
      <div>
        <div class="name">${u.username}</div>
        <div class="meta">${u.followersCount || 0} followers</div>
      </div>
      <button class="follow-btn ${isFollowing ? 'following' : ''}" onclick="toggleFollow('${u._id}', this)">
        ${isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    `;
    list.appendChild(div);
  });
}
async function toggleFollow(userId, btn) {

  // 🚨 BLOCK STATIC MODE
  if (STATIC_MODE) {
    toast('Static mode', 'Follow disabled in static mode', 'warning');
    return;
  }

  const isFollowing = btn.classList.contains('following');

  try {
    const res = await authFetch(`${API}/followers/${userId}`, {
      method: isFollowing ? 'DELETE' : 'POST',
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    if (isFollowing) {
      btn.classList.remove('following');
      btn.textContent = 'Follow';
      followingSet.delete(userId);
    } else {
      btn.classList.add('following');
      btn.textContent = 'Unfollow';
      followingSet.add(userId);
    }
  } catch (err) {
    toast('Error', err.message, 'error');
  }
}

// ===================== NOTIFICATIONS =====================
async function loadNotifications() {
  if (STATIC_MODE) {
    document.getElementById('notif-list').innerHTML = '<div class="notif-empty">No notifications yet</div>';
    return;
  }
  const res = await authFetch(`${API}/notifications`);
  const notifs = await res.json();
  const list = document.getElementById('notif-list');
  list.innerHTML = '';
  if (!notifs.length) { list.innerHTML = '<div class="notif-empty">No notifications yet</div>'; return; }
  notifs.forEach(n => addNotifItem(n, false));
  const unread = notifs.filter(n => !n.read).length;
  updateBadge(unread);
}

function addNotifItem(notif, prepend = true) {
  const list = document.getElementById('notif-list');
  const empty = list.querySelector('.notif-empty');
  if (empty) empty.remove();

  const icons = { new_comment: '💬', new_reply: '↩️', new_like: '❤️', new_follower: '👥' };
  const div = document.createElement('div');
  div.className = `notif-item ${notif.read ? '' : 'unread'}`;
  div.innerHTML = `
    <span class="notif-icon">${icons[notif.type] || '🔔'}</span>
    <div class="notif-text">
      <div>${notif.message}</div>
      <div class="notif-time">${timeAgo(notif.createdAt)}</div>
    </div>
  `;
  if (prepend) list.insertBefore(div, list.firstChild);
  else list.appendChild(div);
}

function toggleNotifications() {
  if (window.innerWidth <= 768) {
    const rightPanel = document.getElementById('right-panel');
    // Always open the right panel
    rightPanel.classList.add('open');
    document.getElementById('right-overlay').classList.add('visible');
    document.getElementById('left-panel').classList.remove('open');
    document.getElementById('left-overlay').classList.remove('visible');
    // After panel slides in, scroll to notif section
    setTimeout(() => {
      const notifPanel = document.getElementById('notif-panel');
      if (notifPanel) {
        rightPanel.scrollTop = notifPanel.offsetTop - rightPanel.offsetTop;
        notifPanel.classList.add('notif-panel-highlight');
        setTimeout(() => notifPanel.classList.remove('notif-panel-highlight'), 1200);
      }
    }, 320);
  } else {
    const notifPanel = document.getElementById('notif-panel');
    if (notifPanel) {
      notifPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      notifPanel.classList.add('notif-panel-highlight');
      setTimeout(() => notifPanel.classList.remove('notif-panel-highlight'), 1200);
    }
  }
}

async function markAllRead() {
  if (!STATIC_MODE) await authFetch(`${API}/notifications/read-all`, { method: 'PATCH' });
  document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  updateBadge(0);
}

function incrementBadge() {
  const badge = document.getElementById('notif-badge');
  const current = parseInt(badge?.textContent) || 0;
  updateBadge(current + 1);
}

function updateBadge(count) {
  ['notif-badge', 'notif-badge-mobile'].forEach(id => {
    const badge = document.getElementById(id);
    if (!badge) return;
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  });
}

// ===================== PROFILE =====================
async function openProfile() {
  if (STATIC_MODE) {
    document.getElementById('profile-pic').src = `https://api.dicebear.com/7.x/lorelei/svg?seed=${currentUser.username}`;
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email || '';
    document.getElementById('profile-followers').textContent = '0 followers';
    document.getElementById('profile-following').textContent = '0 following';
    document.getElementById('profile-bio').value = '';
    document.getElementById('profile-pic-url').value = '';
    document.getElementById('profile-modal').classList.remove('hidden');
    return;
  }
  const res = await authFetch(`${API}/users/me`);
  const user = await res.json();
  document.getElementById('profile-pic').src = user.profilePicture || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.username}`;
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-followers').textContent = `${user.followersCount || 0} followers`;
  document.getElementById('profile-following').textContent = `${user.followingCount || 0} following`;
  document.getElementById('profile-bio').value = user.bio || '';
  document.getElementById('profile-pic-url').value = user.profilePicture || '';
  document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfile() {
  document.getElementById('profile-modal').classList.add('hidden');
}

async function saveProfile() {
  if (STATIC_MODE) { toast('Profile updated', '', 'success'); closeProfile(); return; }
  const bio = document.getElementById('profile-bio').value;
  const profilePicture = document.getElementById('profile-pic-url').value;
  try {
    const res = await authFetch(`${API}/users/me`, {
      method: 'PATCH',
      body: JSON.stringify({ bio, profilePicture }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Update currentUser and persist
    currentUser.bio = data.bio;
    currentUser.profilePicture = data.profilePicture;
    localStorage.setItem('user', JSON.stringify(currentUser));

    // Propagate new avatar everywhere
    const url = avatarUrl(currentUser);
    document.getElementById('nav-avatar').src = url;
    document.getElementById('feed-avatar').src = url;
    document.getElementById('profile-pic').src = url;

    toast('Profile updated', '', 'success');
    closeProfile();
  } catch (err) {
    toast('Error', err.message, 'error');
  }
}

// ===================== HELPERS =====================
function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

// Female-style avatar seeds for members list
const FEMALE_SEEDS = ['Lily', 'Sophie', 'Emma', 'Zara', 'Mia', 'Nora', 'Layla', 'Sara', 'Hana', 'Aisha'];
let _femaleIdx = 0;
const _userAvatarCache = {};

function avatarUrl(user) {
  if (user && user.profilePicture) return user.profilePicture;
  const seed = (user && user.username) ? user.username : 'default';
  // Use lorelei style which gives feminine-looking avatars
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Close mobile panels on outside click is handled by overlay elements

// ===================== ADMIN =====================
async function openAdminPanel() {
  const res = await authFetch(`${API}/users/admin/pending`);
  const users = await res.json();
  const list = document.getElementById('admin-pending-list');
  list.innerHTML = '';
  if (!users.length) {
    list.innerHTML = '<p class="notif-empty">No pending users</p>';
  } else {
    users.forEach(u => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.innerHTML = `
        <img src="https://api.dicebear.com/7.x/lorelei/svg?seed=${u.username}" class="avatar-sm" />
        <div>
          <div class="name">${u.username}</div>
          <div class="meta">${u.email}</div>
        </div>
        <button class="follow-btn" onclick="approveUser('${u._id}', this)">Approve</button>
      `;
      list.appendChild(div);
    });
  }
  document.getElementById('admin-modal').classList.remove('hidden');
}

function closeAdminPanel() {
  document.getElementById('admin-modal').classList.add('hidden');
}

async function approveUser(userId, btn) {
  try {
    const res = await authFetch(`${API}/users/admin/approve/${userId}`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to approve');
    btn.textContent = '✓ Approved';
    btn.disabled = true;
    btn.style.background = 'var(--success)';
    toast('User approved', 'They can now log in', 'success');
  } catch (err) {
    toast('Error', err.message, 'error');
  }
}

// ===================== BOOT =====================
if (token && currentUser) {
  initApp();
}
