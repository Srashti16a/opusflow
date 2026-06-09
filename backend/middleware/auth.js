const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: Access token missing" });
  }

  // Support both "Bearer <token>" and raw token formats
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (id, email, role) to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
