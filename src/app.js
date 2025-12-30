const boardList = document.getElementById('boardList');
const newBoardBtn = document.getElementById('newBoard');
const world = document.getElementById('world');
const boardTitle = document.getElementById('boardTitle');

let currentBoard = null;
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let startX, startY;

function uuid() {
  return crypto.randomUUID();
}

function renderBoards(boards) {
  boardList.innerHTML = '';
  boards.forEach(b => {
    const li = document.createElement('li');
    li.textContent = b.title;
    li.onclick = () => loadBoard(b.id);
    boardList.appendChild(li);
  });
}

async function loadBoard(id) {
  const board = await getBoard(id);
  currentBoard = board;
  boardTitle.textContent = board.title;
  world.innerHTML = '';
  board.notes.forEach(n => createNoteElement(n));
}

function createNoteElement(note) {
  const div = document.createElement('div');
  div.className = 'note';
  div.contentEditable = true;
  div.style.left = note.x + 'px';
  div.style.top = note.y + 'px';
  div.textContent = note.text;

  div.oninput = () => {
    note.text = div.textContent;
    saveBoard(currentBoard);
  };

  let dragging = false;
  div.onmousedown = e => {
    dragging = true;
    e.stopPropagation();
    startX = e.clientX - note.x;
    startY = e.clientY - note.y;
  };

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    note.x = e.clientX - startX;
    note.y = e.clientY - startY;
    div.style.left = note.x + 'px';
    div.style.top = note.y + 'px';
  });

  window.addEventListener('mouseup', () => {
    if (dragging) saveBoard(currentBoard);
    dragging = false;
  });

  world.appendChild(div);
}

world.ondblclick = async e => {
  if (!currentBoard) return;
  const note = {
    id: uuid(),
    x: e.offsetX,
    y: e.offsetY,
    text: ''
  };
  currentBoard.notes.push(note);
  createNoteElement(note);
  await saveBoard(currentBoard);
};

world.onmousedown = e => {
  if (e.target !== world) return;
  isPanning = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
};

window.onmousemove = e => {
  if (!isPanning) return;
  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;
  world.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
};

window.onmouseup = () => {
  isPanning = false;
};

newBoardBtn.onclick = async () => {
  const title = prompt('Nome do quadro:');
  if (!title) return;
  const board = {
    id: uuid(),
    title,
    notes: []
  };
  await saveBoard(board);
  renderBoards(await getBoards());
};

(async function init() {
  const boards = await getBoards();
  renderBoards(boards);
})();
