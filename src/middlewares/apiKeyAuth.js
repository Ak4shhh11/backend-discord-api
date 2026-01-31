module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization header missing"
    });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  if (token !== process.env.API_KEY) {
    return res.status(403).json({
      message: "Invalid API Key"
    });
  }

  next();
};
