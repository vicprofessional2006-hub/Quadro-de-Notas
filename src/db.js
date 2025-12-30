const db = new Dexie('quadrosDB');

db.version(1).stores({
  boards: 'id, title, updatedAt'
});

async function getBoards() {
  return await db.boards.toArray();
}

async function saveBoard(board) {
  board.updatedAt = new Date().toISOString();
  await db.boards.put(board);
}

async function getBoard(id) {
  return await db.boards.get(id);
}
