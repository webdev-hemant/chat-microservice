const { verifyToken } = require("../utils");

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const user = await verifyToken(token);
    socket.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    next(new Error("Authentication error"));
  }
};

module.exports = { authenticateSocket };
