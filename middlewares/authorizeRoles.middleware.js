export default function authorizeRoles(...roles) {
  return (req, res, next) => {
    // 1️⃣ Check if the user has the required role
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient role." });
    }

    // 2️⃣ If the user has the required role, continue to the next middleware or route
    next();
  };
}
