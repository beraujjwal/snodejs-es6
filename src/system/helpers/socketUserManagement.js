const users = new Map();

const USER_PREFIX = 'socket_user:'; // Key prefix

// Add user
async function addUser({ id, name, room }) {
  const user = { name, room };
  await redis.set(`${USER_PREFIX}${id}`, JSON.stringify(user));
  return { user };
}

// Remove user
async function removeUser(id) {
  const key = `${USER_PREFIX}${id}`;
  const userData = await redis.get(key);
  if (userData) {
    await redis.del(key);
    return JSON.parse(userData);
  }
  return null;
}

// Get user
async function getUser(id) {
  const userData = await redis.get(`${USER_PREFIX}${id}`);
  return userData ? JSON.parse(userData) : null;
}

// Get all users in a room
async function getUsersInRoom(room) {
  const keys = await redis.keys(`${USER_PREFIX}*`);
  const users = [];
  for (const key of keys) {
    const user = JSON.parse(await redis.get(key));
    if (user.room === room) users.push(user);
  }
  return users;
}
