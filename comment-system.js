const socket = new WebSocket('wss://comment-ws.onrender.com');
let comments = [];

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'new_comment') {
    comments.push(msg.data);
    renderComments();
  } else if (msg.type === 'delete_comment') {
    comments = comments.filter(c => c.id !== msg.data.id);
    renderComments();
  }
};

function submitComment() {
  const text = document.getElementById('comment-input').value.trim();
  const password = document.getElementById('comment-password').value.trim();
  if (!text || !password) {
    alert('내용과 비밀번호를 모두 입력하세요');
    return;
  }

  const comment = {
    id: Date.now(),
    text: text,
    password: password,
    likes: 0
  };

  comments.push(comment);
  renderComments();
  socket.send(JSON.stringify({ type: 'new_comment', data: comment }));

  document.getElementById('comment-input').value = '';
  document.getElementById('comment-password').value = '';
}

function likeComment(id) {
  const comment = comments.find((c) => c.id === id);
  if (comment) {
    comment.likes += 1;
    renderComments();
  }
}

function deleteComment(id) {
  const pw = prompt('비밀번호를 입력하세요');
  const comment = comments.find((c) => c.id === id);
  if (comment && pw === comment.password) {
    comments = comments.filter((c) => c.id !== id);
    renderComments();
    socket.send(JSON.stringify({ type: 'delete_comment', data: { id: id } }));
  } else {
    alert('비밀번호가 틀렸습니다');
  }
}

function renderComments() {
  const list = document.getElementById('comment-list');
  list.innerHTML = '';
  comments.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `
      <div>${c.text}</div>
      <small>
        ❤️ <span class="like-btn" onclick="likeComment(${c.id})">${c.likes}</span>
        | <a href="#" onclick="deleteComment(${c.id}); return false;">삭제</a>
      </small>
    `;
    list.appendChild(div);
  });
}