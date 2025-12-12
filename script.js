/* ------------------------------------------- */
/* 1. 요소 가져오기 (기존 + 신규)              */
/* ------------------------------------------- */
// 채팅 공통
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatWindow = document.getElementById('chat-window');
const imageInput = document.getElementById('image-input');
const fileInput = document.getElementById('file-input');
const attachmentButton = document.getElementById('attachment-button');
const attachmentMenu = document.getElementById('attachment-menu');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreviewImg = document.getElementById('image-preview-img');
const cancelImagePreviewBtn = document.getElementById('cancel-image-preview');

// 화면 전환용
const serverNav = document.getElementById('server-nav');
const appWrapper = document.getElementById('app-wrapper');
const communityButton = document.getElementById('community-button');
const communityFeed = document.getElementById('community-feed');
const addServerButton = document.getElementById('add-server-button');

// 채팅/친구 UI 스위치용
const chatContainer = document.getElementById('chat-container');
const chatAreaWrapper = document.getElementById('chat-area-wrapper');
const friendsView = document.getElementById('friends-view');
const friendsNavButtons = document.getElementById('friends-nav-buttons');
const friendsContentPanes = document.querySelectorAll('.friends-content-pane');
const onlineFriendsList = document.getElementById('online-friends-list'); // [신규]
const allFriendsList = document.getElementById('all-friends-list'); // [신규]

// 채널/DM 목록용
const channelContent = document.getElementById('channel-content');
const friendsListUL = document.getElementById('friends-list-ul');
const friendsBtn = document.getElementById('friends-btn');
const serverChannelsSection = document.getElementById('server-channels-section');
const channelListUL = document.getElementById('channel-list-ul');
const dmListUL = document.getElementById('dm-list-ul');
const channelHeader = document.querySelector('#channel-header h3');
const addChannelBtn = document.getElementById('add-channel');

// 채팅창 헤더용
const chatHeaderTitle = document.querySelector('#chat-header h3');
const chatHeaderTopic = document.querySelector('#chat-header p');

// 커뮤니티 피드용
const feedContent = document.getElementById('feed-content');
const postModal = document.getElementById('post-modal');
const openPostModalBtn = document.getElementById('open-post-modal-btn');
const closePostModalBtn = document.getElementById('close-post-modal-btn');
const postForm = document.getElementById('post-form');
const postCategorySelect = document.getElementById('post-category-select');
const postTitleInput = document.getElementById('post-title-input');
const postContentInput = document.getElementById('post-content-input');
const categoryFilters = document.getElementById('category-filters');

// 게시글 상세 보기용
const postDetailView = document.getElementById('post-detail-view');
const backToFeedBtn = document.getElementById('back-to-feed-btn');
const detailPostTitle = document.getElementById('detail-post-title');
const detailPostContent = document.getElementById('detail-post-content');
const detailRecommendBtn = document.getElementById('detail-recommend-btn');
const detailCommentList = document.getElementById('detail-comment-list');
const detailCommentCount = document.getElementById('detail-comment-count');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentSortOptions = document.getElementById('comment-sort-options');
const detailAuthorPic = document.getElementById('detail-author-pic');
const detailAuthorName = document.getElementById('detail-author-name');
const detailPostMeta = document.getElementById('detail-post-meta');
const detailTitleMain = document.getElementById('detail-title-main');
const detailContentMain = document.getElementById('detail-content-main');

// 설정용
const openSettingsBtn = document.getElementById('open-settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const usernameInput = document.getElementById('username-input');
const usertagInput = document.getElementById('usertag-input');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const profileName = document.getElementById('user-profile-name');
const profileTag = document.getElementById('user-profile-tag');
const userProfilePic = document.getElementById('user-profile-pic');
const profilePicUrlInput = document.getElementById('profile-pic-url-input');
const profilePicUpload = document.getElementById('profile-pic-upload');
const cropperContainer = document.getElementById('cropper-container');
const profilePicPreview = document.getElementById('profile-pic-preview');


/* ------------------------------------------- */
/* 2. 데이터 저장소 (Mock DB 및 상태)           */
/* ------------------------------------------- */
let communityPosts = [];
let mockDatabase = {};
let mockDMDatabase = {
    "test": [
        { type: 'text', sender: 'received', text: '안녕하세요, test 유저입니다.' },
        { type: 'text', sender: 'sent', text: '아, 반갑습니다! DM 테스트 중입니다.' }
    ]
};
let mockFriendsList = [
    { name: 'test', tag: '#0001', picUrl: 'https://via.placeholder.com/40', status: 'online' },
    { name: 'OfflineUser', tag: '#0002', picUrl: 'https://via.placeholder.com/40', status: 'offline' }
];
let currentServerId = null;
let currentChannelName = null;
let userProfile = {
    name: 'YourName',
    tag: '#1234',
    picUrl: 'https://via.placeholder.com/32'
};
let pendingImage = null;
let tempProfilePicUrl = null;
let currentCategory = 'all';
let currentCommentSort = 'newest';


/* ------------------------------------------- */
/* 3. 커뮤니티 피드 기능 (글쓰기/상세보기/댓글) */
/* ------------------------------------------- */
openPostModalBtn.addEventListener('click', () => postModal.classList.remove('hidden'));
closePostModalBtn.addEventListener('click', () => postModal.classList.add('hidden'));
postModal.addEventListener('click', (event) => {
    if (event.target === postModal) postModal.classList.add('hidden');
});

postForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const category = postCategorySelect.value;
    const title = postTitleInput.value.trim();
    const content = postContentInput.value.trim();
    if (title === '' || content === '') return;
    const newPost = {
        id: `post_${Date.now()}`,
        author: { ...userProfile },
        category: category,
        title, content,
        meta: `r/${category} · 방금 전`,
        recommends: 0,
        recommended: false,
        comments: [],
        commentCount: 0,
        timestamp: Date.now()
    };
    if (communityPosts.length === 0) {
        newPost.comments.push({ 
            author: 'Admin', 
            text: '첫 번째 게시글에 오신 것을 환영합니다!', 
            timestamp: Date.now() 
        });
        newPost.commentCount = 1;
    }
    communityPosts.unshift(newPost);
    renderCommunityFeed();
    postTitleInput.value = '';
    postContentInput.value = '';
    postModal.classList.add('hidden');
});

categoryFilters.addEventListener('click', (event) => {
    const clickedBtn = event.target.closest('.category-btn');
    if (clickedBtn) {
        categoryFilters.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedBtn.classList.add('active');
        currentCategory = clickedBtn.dataset.category;
        renderCommunityFeed();
    }
});

function renderCommunityFeed() {
    const filteredPosts = communityPosts.filter(post => {
        return currentCategory === 'all' || post.category === currentCategory;
    });
    feedContent.innerHTML = '';
    if (filteredPosts.length === 0) {
        const message = (currentCategory === 'all')
            ? '아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!'
            : `아직 [${currentCategory}] 카테고리에 글이 없습니다.`;
        feedContent.innerHTML = `<p class="empty-feed-message">${message}</p>`;
        return;
    }
    const categoryNames = { 'free': '자유', 'question': '질문', 'info': '정보' };
    filteredPosts.forEach(post => {
        const safeTitle = post.title.replace(/</g, "&lt;");
        const categoryName = categoryNames[post.category] || '기타';
        const meta = `작성자: ${post.author.name} · 💬 ${post.commentCount} · 👍 ${post.recommends}`;
        
        const postHTML = `
            <div class="post-link" data-id="${post.id}">
                <span class="post-category-tag">[${categoryName}]</span>
                <h3 class="post-title">${safeTitle}</h3>
                <span class="post-meta">${meta}</span>
            </div>`;
        feedContent.innerHTML += postHTML;
    });
}

feedContent.addEventListener('click', function(event) {
    const postLink = event.target.closest('.post-link');
    if (postLink) {
        openPostDetail(postLink.dataset.id);
    }
});

function renderComments(post) {
    detailCommentCount.innerText = post.commentCount;
    detailCommentList.innerHTML = '';
    const sortedComments = (currentCommentSort === 'newest') 
        ? [...post.comments].reverse() 
        : post.comments;
    if (sortedComments.length > 0) {
        sortedComments.forEach(comment => {
            detailCommentList.innerHTML += `
            <div class="comment">
                <span class="comment-author">${comment.author.replace(/</g, "&lt;")}</span>
                <p class="comment-content">${comment.text.replace(/</g, "&lt;")}</p>
            </div>`;
        });
    } else {
        detailCommentList.innerHTML = '<p>아직 댓글이 없습니다.</p>';
    }
}

function openPostDetail(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;
    detailPostTitle.innerText = post.title; 
    detailAuthorPic.src = post.author.picUrl;
    detailAuthorName.innerText = post.author.name;
    detailPostMeta.innerText = post.meta;
    detailTitleMain.innerText = post.title;
    detailContentMain.innerHTML = `<p>${post.content.replace(/</g, "&lt;").replace(/\n/g, '<br>')}</p>`;
    detailRecommendBtn.querySelector('span').innerText = post.recommends;
    detailRecommendBtn.classList.toggle('recommended', post.recommended);
    detailRecommendBtn.dataset.postId = postId;
    commentForm.dataset.postId = postId;
    currentCommentSort = 'newest';
    commentSortOptions.querySelector('.sort-btn[data-sort="newest"]').classList.add('active');
    commentSortOptions.querySelector('.sort-btn[data-sort="oldest"]').classList.remove('active');
    renderComments(post);
    communityFeed.classList.add('hidden');
    postDetailView.classList.remove('hidden');
    postDetailView.scrollTop = 0;
}

backToFeedBtn.addEventListener('click', () => {
    postDetailView.classList.add('hidden');
    communityFeed.classList.remove('hidden');
    renderCommunityFeed();
});

detailRecommendBtn.addEventListener('click', function() {
    const postId = this.dataset.postId;
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;
    if (post.recommended) {
        post.recommends--;
        post.recommended = false;
        this.classList.remove('recommended');
    } else {
        post.recommends++;
        post.recommended = true;
        this.classList.add('recommended');
    }
    this.querySelector('span').innerText = post.recommends;
});

commentForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const postId = this.dataset.postId;
    const post = communityPosts.find(p => p.id === postId);
    const commentText = commentInput.value.trim();
    if (post && commentText !== '') {
        const newComment = {
            author: userProfile.name,
            text: commentText,
            timestamp: Date.now()
        };
        post.comments.push(newComment);
        post.commentCount++;
        renderComments(post);
        commentInput.value = '';
    }
});

commentSortOptions.addEventListener('click', (event) => {
    const clickedBtn = event.target.closest('.sort-btn');
    if (clickedBtn) {
        const sortType = clickedBtn.dataset.sort;
        if (sortType === currentCommentSort) return;
        currentCommentSort = sortType;
        commentSortOptions.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === sortType);
        });
        const postId = commentForm.dataset.postId;
        const post = communityPosts.find(p => p.id === postId);
        if (post) {
            renderComments(post);
        }
    }
});

/* ------------------------------------------- */
/* 4. 서버/채널/친구 전환 기능                  */
/* ------------------------------------------- */
function showChatApp() {
    appWrapper.classList.remove('hidden');
    communityFeed.classList.add('hidden');
    postDetailView.classList.add('hidden');
}
function showCommunityFeed() {
    appWrapper.classList.add('hidden');
    communityFeed.classList.remove('hidden');
    postDetailView.classList.add('hidden');
}
function showFriendsView() {
    chatAreaWrapper.classList.add('hidden');
    friendsView.classList.remove('hidden');
    document.querySelectorAll('#channel-content .active').forEach(el => el.classList.remove('active'));
    friendsBtn.classList.add('active');
}
function showChatWindow() {
    chatAreaWrapper.classList.remove('hidden');
    friendsView.classList.add('hidden');
    friendsBtn.classList.remove('active');
}

addServerButton.addEventListener('click', function() {
    const serverName = prompt('새 서버의 이름을 입력하세요:');
    if (serverName && serverName.trim() !== '') { addNewServer(serverName.trim()); }
});

function addNewServer(name) {
    const serverId = `server_${Date.now()}`;
    const firstLetter = name.charAt(0).toUpperCase();
    const iconHTML = `<div class="server-icon" title="${name}" data-server-id="${serverId}">${firstLetter}</div>`;
    addServerButton.insertAdjacentHTML('beforebegin', iconHTML);
    mockDatabase[serverId] = {
        name: name,
        channels: {
            "# general": [ { type: 'text', sender: 'received', text: `${name} 서버의 #general 채널에 오신 것을 환영합니다.` } ],
            "# 공지사항": [ { type: 'text', sender: 'received', text: '중요한 공지사항이 여기에 표시됩니다.' } ]
        }
    };
    const newIcon = serverNav.querySelector(`[data-server-id="${serverId}"]`);
    if (newIcon) { newIcon.click(); }
}

function loadChatHome() {
    currentServerId = 'home';
    currentChannelName = null;
    showFriendsView();
    channelHeader.innerText = "친구";
    friendsListUL.classList.remove('hidden');
    dmListUL.closest('.channel-group').classList.remove('hidden');
    serverChannelsSection.classList.add('hidden');
    loadGlobalDMs();
    switchFriendsTab('online');
}

function loadServerChannels(serverId) {
    const serverData = mockDatabase[serverId];
    if (!serverData) return;
    currentServerId = serverId;
    showChatWindow();
    channelHeader.innerText = serverData.name;
    friendsListUL.classList.add('hidden');
    dmListUL.closest('.channel-group').classList.add('hidden');
    serverChannelsSection.classList.remove('hidden');
    channelListUL.innerHTML = '';
    let isFirstChannel = true;
    Object.keys(serverData.channels).forEach(channelName => {
        const activeClass = isFirstChannel ? 'active' : '';
        channelListUL.innerHTML += `<li class="channel-item ${activeClass}" data-name="${channelName}">${channelName}</li>`;
        if (isFirstChannel) {
            loadRoom(currentServerId, channelName);
            isFirstChannel = false;
        }
    });
}

function loadGlobalDMs() {
    dmListUL.innerHTML = '';
    const dmName = "test";
    const dmHTML = `
        <li class="dm-item" data-name="${dmName}">
            <span class="status-indicator online"></span>
            <span>${dmName}</span>
        </li>
    `;
    dmListUL.innerHTML += dmHTML;
}

serverNav.addEventListener('click', function(event) {
    const clickedIcon = event.target.closest('.server-icon');
    if (!clickedIcon || clickedIcon.id === 'add-server-button') return;
    serverNav.querySelectorAll('.server-icon').forEach(icon => icon.classList.remove('active'));
    clickedIcon.classList.add('active');
    if (clickedIcon.id === 'home-button') {
        showChatApp();
        loadChatHome();
    } else if (clickedIcon.id === 'community-button') {
        showCommunityFeed();
    } else {
        showChatApp();
        loadServerChannels(clickedIcon.dataset.serverId);
    }
});

channelContent.addEventListener('click', function(event) {
    const clickedItem = event.target.closest('.channel-item, .dm-item');
    if (!clickedItem) return;
    document.querySelectorAll('#channel-content .active').forEach(el => el.classList.remove('active'));
    clickedItem.classList.add('active');
    const name = clickedItem.dataset.name;
    if (clickedItem.id === 'friends-btn') {
        currentChannelName = null;
        showFriendsView();
        switchFriendsTab('online');
    } else if (clickedItem.classList.contains('channel-item')) {
        showChatWindow();
        loadRoom(currentServerId, name);
    } else if (clickedItem.classList.contains('dm-item')) {
        currentChannelName = null;
        showChatWindow();
        loadDMRoom(name);
    }
});

// '친구' 탭 전환 로직
function switchFriendsTab(view) {
    friendsNavButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    friendsContentPanes.forEach(pane => {
        // [수정] 탭 ID와 view 이름을 일치시킴
        if (pane.id === `${view}-friends-view` || (view === 'activity' && pane.id === 'activity-feed-view') || (view === 'add' && pane.id === 'add-friend-view')) {
            pane.classList.add('active');
            pane.classList.remove('hidden');
        } else {
            pane.classList.add('hidden');
            pane.classList.remove('active');
        }
    });

    if (view === 'online') {
        renderOnlineFriends();
    } else if (view === 'all') {
        renderAllFriends();
    } else if (view === 'activity') {
        renderActivityFeed();
    }
    
    const button = friendsNavButtons.querySelector(`[data-view="${view}"]`);
    if(button) button.classList.add('active');
}

friendsNavButtons.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button && button.dataset.view) {
        switchFriendsTab(button.dataset.view);
    }
});

function renderActivityFeed() {
    const feedList = document.getElementById('activity-feed-list');
    let activityItems = [];
    communityPosts.forEach(post => {
        if (post.author.name === userProfile.name) {
            activityItems.push({ type: 'post', data: post, timestamp: post.timestamp });
        }
    });
    communityPosts.forEach(post => {
        post.comments.forEach(comment => {
            if (comment.author === userProfile.name) {
                if (!activityItems.some(item => item.type === 'post' && item.data.id === post.id)) {
                    activityItems.push({
                        type: 'comment',
                        data: post,
                        comment: comment,
                        timestamp: comment.timestamp
                    });
                }
            }
        });
    });
    activityItems.push({
        type: 'mention',
        data: { channel: '#general', author: 'test', text: '...이거 @YourName 님께 물어봐야 할 듯' },
        timestamp: Date.now() - 3600000
    });
    activityItems.sort((a, b) => b.timestamp - a.timestamp);
    feedList.innerHTML = '';
    if (activityItems.length === 0) {
        feedList.innerHTML = '<p class="placeholder-text">아직 활동이 없습니다.</p>';
        return;
    }
    activityItems.forEach(item => {
        let html = '';
        if (item.type === 'post') {
            html = `
            <div class="activity-item">
                <div class="activity-header"><span class="icon">✍️</span> <strong>내가 쓴 글:</strong></div>
                <div class="activity-content">
                    <a href="#" class="activity-post-link" data-id="${item.data.id}">${item.data.title}</a>
                </div>
            </div>`;
        } else if (item.type === 'comment') {
            html = `
            <div class="activity-item">
                <div class="activity-header"><span class="icon">💬</span> <strong>내가 댓글 단 글:</strong></div>
                <div class="activity-content">
                    <a href="#" class="activity-post-link" data-id="${item.data.id}">${item.data.title}</a>
                    <span class="comment-snippet">"${item.comment.text}"</span>
                </div>
            </div>`;
        } else if (item.type === 'mention') {
            html = `
            <div class="activity-item">
                <div class="activity-header"><span class="icon">🔔</span> <strong>나를 언급:</strong></div>
                <div class="activity-content">
                    <strong>${item.data.author}</strong>님이 <strong>${item.data.channel}</strong>에서:
                    <span class="comment-snippet">"${item.data.text}"</span>
                </div>
            </div>`;
        }
        feedList.innerHTML += html;
    });
}

// '온라인' 탭 친구 목록 렌더링
function renderOnlineFriends() {
    const listEl = document.getElementById('online-friends-list');
    listEl.innerHTML = '';
    const onlineFriends = mockFriendsList.filter(f => f.status === 'online');
    if (onlineFriends.length === 0) {
        listEl.innerHTML = '<p class="placeholder-text">온라인인 친구가 없습니다.</p>';
        return;
    }
    listEl.innerHTML = `<h4>온라인 — ${onlineFriends.length}</h4>`;
    onlineFriends.forEach(friend => {
        listEl.innerHTML += `
        <div class="friend-item" data-name="${friend.name}">
            <img src="${friend.picUrl}" alt="${friend.name}" class="profile-pic">
            <div class="user-info">
                <strong>${friend.name}</strong>
                <span class="user-status ${friend.status}">${friend.status}</span>
            </div>
        </div>
        `;
    });
}

// [수정] '모두' 탭 (오프라인 친구 포함)
function renderAllFriends() {
    const listEl = document.getElementById('all-friends-list');
    listEl.innerHTML = '';
    const onlineFriends = mockFriendsList.filter(f => f.status === 'online');
    const offlineFriends = mockFriendsList.filter(f => f.status !== 'online');
    if (mockFriendsList.length === 0) {
        listEl.innerHTML = '<p class="placeholder-text">친구가 없습니다.</p>';
        return;
    }
    if (onlineFriends.length > 0) {
        listEl.innerHTML += `<h4>온라인 — ${onlineFriends.length}</h4>`;
        onlineFriends.forEach(friend => {
            listEl.innerHTML += `
            <div class="friend-item" data-name="${friend.name}">
                <img src="${friend.picUrl}" alt="${friend.name}" class="profile-pic">
                <div class="user-info">
                    <strong>${friend.name}</strong>
                    <span class="user-status ${friend.status}">${friend.status}</span>
                </div>
            </div>
            `;
        });
    }
    if (offlineFriends.length > 0) {
        listEl.innerHTML += `<h4 style="margin-top: 20px;">오프라인 — ${offlineFriends.length}</h4>`;
        offlineFriends.forEach(friend => {
            listEl.innerHTML += `
            <div class="friend-item" data-name="${friend.name}">
                <img src="${friend.picUrl}" alt="${friend.name}" class="profile-pic">
                <div class="user-info">
                    <strong>${friend.name}</strong>
                    <span class="user-status offline">${friend.status}</span>
                </div>
            </div>
            `;
        });
    }
}

// [신규] '친구' 탭에서 친구 클릭 시 DM으로 이동
friendsView.addEventListener('click', (e) => {
    const friendItem = e.target.closest('.friend-item');
    if (friendItem) {
        const friendName = friendItem.dataset.name;
        const dmItem = dmListUL.querySelector(`.dm-item[data-name="${friendName}"]`);
        
        if (dmItem) {
            dmItem.click(); // 사이드바의 DM 항목을 클릭
        } else {
            alert(`'${friendName}'님과의 DM방이 아직 없습니다. (DM 생성 로직 필요)`);
        }
    }
});


document.getElementById('activity-feed-view').addEventListener('click', (e) => {
    const link = e.target.closest('.activity-post-link');
    if (link) {
        e.preventDefault();
        const postId = link.dataset.id;
        appWrapper.classList.add('hidden');
        openPostDetail(postId);
    }
});


/* ------------------------------------------- */
/* 5. 채팅방 기능 (메시지 전송/로드) (이전과 동일) */
/* ------------------------------------------- */
function loadRoom(serverId, channelName) {
    currentServerId = serverId;
    currentChannelName = channelName;
    chatWindow.innerHTML = '';
    let messages = [];
    if (mockDatabase[serverId] && mockDatabase[serverId].channels[channelName]) {
        messages = mockDatabase[serverId].channels[channelName];
    }
    if (messages.length > 0) {
        messages.forEach(msg => {
            const sender = msg.sender || 'received';
            if (msg.type === 'image') displayImage(msg.url, sender, msg.text);
            else if (msg.type === 'file') displayFile(msg.file, sender);
            else displayMessage(msg.text, sender);
        });
    } else {
        displayMessage(`${channelName} 채널에 오신 것을 환영합니다.`, 'received');
    }
    chatHeaderTitle.innerText = channelName;
    messageInput.placeholder = `${channelName}에 메시지 보내기`;
    chatHeaderTopic.innerText = `${channelName} 채널입니다.`;
}
function loadDMRoom(dmName) {
    currentChannelName = null;
    chatWindow.innerHTML = '';
    const messages = mockDMDatabase[dmName] || [];
    if (messages.length > 0) {
        messages.forEach(msg => {
            const sender = msg.sender || 'received';
            if (msg.type === 'image') displayImage(msg.url, sender, msg.text);
            else if (msg.type === 'file') displayFile(msg.file, sender);
            else displayMessage(msg.text, sender);
        });
    } else {
        displayMessage(`${dmName}님과의 대화입니다.`, 'received');
    }
    chatHeaderTitle.innerText = dmName;
    messageInput.placeholder = `@${dmName}에게 메시지 보내기`;
    chatHeaderTopic.innerText = '개인 메시지입니다.';
}
messageForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const messageText = messageInput.value.trim();
    const hasText = messageText !== '';
    const hasImage = pendingImage !== null;
    if (!hasText && !hasImage) {
        closeAttachmentMenu();
        return;
    }
    if (hasImage) {
        sendImageMessage(pendingImage, messageText);
    } else if (hasText) {
        sendTextMessage(messageText);
    }
    messageInput.value = '';
    pendingImage = null;
    imagePreviewContainer.classList.add('hidden');
    imagePreviewImg.src = '';
    closeAttachmentMenu();
});
function sendTextMessage(text) {
    if (text === '') return;
    displayMessage(text, 'sent');
    const newMessage = { type: 'text', text: text, sender: 'sent' };
    saveMessage(newMessage);
}
function sendImageMessage(imageUrl, caption = '') {
    displayImage(imageUrl, 'sent', caption);
    const newMessage = { type: 'image', url: imageUrl, text: caption, sender: 'sent' };
    saveMessage(newMessage);
}
function sendFileMessage(fileObject) {
    displayFile(fileObject, 'sent');
    const newMessage = { type: 'file', file: fileObject, sender: 'sent' };
    saveMessage(newMessage);
    closeAttachmentMenu();
}
function saveMessage(newMessage) {
    if (currentServerId !== 'home' && currentChannelName) {
        mockDatabase[currentServerId].channels[currentChannelName].push(newMessage);
    } else if (currentServerId === 'home' && !currentChannelName) {
        const dmName = chatHeaderTitle.innerText;
        if (mockDMDatabase[dmName]) {
            mockDMDatabase[dmName].push(newMessage);
        }
    }
}

/* ------------------------------------------- */
/* 6. 유틸리티 함수 (파일 첨부 및 붙여넣기) (이전과 동일) */
/* ------------------------------------------- */
messageInput.addEventListener('paste', function(event) {
    const items = (event.clipboardData || window.clipboardData).items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            event.preventDefault();
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function(e) {
                pendingImage = e.target.result;
                imagePreviewImg.src = pendingImage;
                imagePreviewContainer.classList.remove('hidden');
                messageInput.focus();
            };
            reader.readAsDataURL(blob);
            return;
        }
    }
});
imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            pendingImage = e.target.result;
            imagePreviewImg.src = pendingImage;
            imagePreviewContainer.classList.remove('hidden');
            messageInput.focus();
        };
        reader.readAsDataURL(file);
        event.target.value = null;
        closeAttachmentMenu();
    }
});
cancelImagePreviewBtn.addEventListener('click', () => {
    pendingImage = null;
    imagePreviewContainer.classList.add('hidden');
    imagePreviewImg.src = '';
});
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const fileObject = { name: file.name, url: URL.createObjectURL(file) };
        sendFileMessage(fileObject);
        event.target.value = null;
        closeAttachmentMenu();
    }
});
attachmentButton.addEventListener('click', function(event) { 
    event.stopPropagation(); 
    attachmentMenu.classList.toggle('active'); 
});
function closeAttachmentMenu() { 
    attachmentMenu.classList.remove('active'); 
}
window.addEventListener('click', function(event) {
    if (!attachmentMenu.contains(event.target) && event.target !== attachmentButton) {
        closeAttachmentMenu();
    }
    if (event.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});
function displayMessage(text, type) { 
    const el = document.createElement('div'); 
    el.classList.add('message', type); 
    el.innerText = text; 
    chatWindow.appendChild(el); 
    scrollToBottom(); 
}
function displayImage(imageUrl, type, caption) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    messageElement.appendChild(imgElement);
    if (caption && caption.trim() !== '') {
        const captionElement = document.createElement('p');
        captionElement.classList.add('image-caption');
        captionElement.innerText = caption;
        messageElement.appendChild(captionElement);
    }
    chatWindow.appendChild(messageElement);
    scrollToBottom();
}
function displayFile(fileObject, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type, 'file-bubble');
    const linkElement = document.createElement('a');
    linkElement.href = fileObject.url;
    linkElement.download = fileObject.name;
    linkElement.innerText = fileObject.name;
    messageElement.appendChild(linkElement);
    chatWindow.appendChild(messageElement);
    scrollToBottom();
}
function scrollToBottom() { 
    chatWindow.scrollTop = chatWindow.scrollHeight; 
}
addChannelBtn.addEventListener('click', function() {
    if (!currentServerId || currentServerId === 'home') {
        alert('채널을 추가할 서버를 먼저 선택해주세요.');
        return;
    }
    let channelName = prompt("새 채널 이름을 입력하세요:", "#");
    if (!channelName || channelName.trim() === "" || channelName.trim() === "#") {
        return;
    }
    channelName = "#" + channelName.replace(/#/g, "").replace(/\s/g, "-").trim();
    if (mockDatabase[currentServerId].channels[channelName]) {
        alert("이미 존재하는 채널 이름입니다.");
        return;
    }
    mockDatabase[currentServerId].channels[channelName] = [
        { type: 'text', sender: 'received', text: `${channelName} 채널에 오신 것을 환영합니다.` }
    ];
    const newChannelElement = document.createElement('li');
    newChannelElement.classList.add('channel-item');
    newChannelElement.dataset.name = channelName;
    newChannelElement.innerText = channelName;
    channelListUL.appendChild(newChannelElement);
    document.querySelectorAll('#channel-content .active').forEach(el => el.classList.remove('active'));
    newChannelElement.classList.add('active');
    showChatWindow();
    loadRoom(currentServerId, channelName);
});
document.getElementById('add-dm').addEventListener('click', function() { alert('새 개인 메시지 시작 (UI 팝업 구현 필요)'); });

/* ------------------------------------------- */
/* 7. 설정 및 다크모드 기능 (이전과 동일)         */
/* ------------------------------------------- */
function cropImageToCircle(imageUrl) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const size = Math.min(img.width, img.height);
            canvas.width = 128;
            canvas.height = 128;
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;
            ctx.beginPath();
            ctx.arc(64, 64, 64, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x, y, size, size, 0, 0, 128, 128);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            reject(new Error('Image failed to load for cropping.'));
        };
        img.src = imageUrl;
    });
}
profilePicUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profilePicPreview.src = e.target.result;
            tempProfilePicUrl = e.target.result;
            cropperContainer.classList.remove('hidden');
            profilePicUrlInput.value = '';
        };
        reader.readAsDataURL(file);
    }
});
function updateProfileUI(name, tag, picUrl) {
    profileName.innerText = name;
    profileTag.innerText = tag.startsWith('#') ? tag : `#${tag}`;
    userProfilePic.src = picUrl || 'https://via.placeholder.com/32';
}
openSettingsBtn.addEventListener('click', () => {
    usernameInput.value = userProfile.name;
    usertagInput.value = userProfile.tag.replace('#', '');
    profilePicUrlInput.value = userProfile.picUrl.startsWith('data:') ? '' : userProfile.picUrl;
    profilePicPreview.src = userProfile.picUrl;
    cropperContainer.classList.remove('hidden');
    tempProfilePicUrl = null;
    settingsModal.classList.remove('hidden');
});
closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});
saveSettingsBtn.addEventListener('click', async () => {
    const newName = usernameInput.value.trim();
    let newTag = usertagInput.value.trim();
    if (newName === "") {
        alert("사용자 이름은 비워둘 수 없습니다.");
        return;
    }
    if (newTag.length !== 4 || isNaN(newTag)) {
        newTag = "0000";
    }
    userProfile.name = newName;
    userProfile.tag = `#${newTag}`;
    const urlFromInput = profilePicUrlInput.value.trim();
    if (tempProfilePicUrl) {
        try {
            const croppedImageUrl = await cropImageToCircle(tempProfilePicUrl);
            userProfile.picUrl = croppedImageUrl;
        } catch (error) {
            console.error("Error cropping image:", error);
            userProfile.picUrl = tempProfilePicUrl;
        }
    } else if (urlFromInput && urlFromInput.startsWith('http')) {
        userProfile.picUrl = urlFromInput;
    }
    updateProfileUI(userProfile.name, userProfile.tag, userProfile.picUrl);
    tempProfilePicUrl = null;
    settingsModal.classList.add('hidden');
});
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

/* ------------------------------------------- */
/* 8. 앱 초기 로드 설정 (이전과 동일)           */
/* ------------------------------------------- */
loadChatHome();
updateProfileUI(userProfile.name, userProfile.tag, userProfile.picUrl);
