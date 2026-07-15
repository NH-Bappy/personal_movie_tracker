const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

// to check Token
// read the token from the request
// Check if token is valid
exports.authMiddleware = async (req, res, next) => {
  console.log("auth middleware reached");

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; //["Bearer" "token"]
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    //verify the token is valid and extract the user Id
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true }
    });
    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
