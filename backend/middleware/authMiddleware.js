const jwt = require("jsonwebtoken");

// This middleware protects routes that need a valid logged-in user
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // We expect the token in this format:
  // Authorization: Bearer your_jwt_token_here
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided. Access denied"
    });
  }

  // Split the header and take only the token part after "Bearer"
  const token = authHeader.split(" ")[1];

  try {
    // Verify checks whether the token is real and signed with our secret key
    // If the token is valid, decoded will contain the data we stored in it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user id from the token to the request object
    // This makes it available in the next middleware or controller
    req.userId = decoded.id;

    next();
  } catch (error) {
    // If verify fails, the token is invalid or expired
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = protect;
