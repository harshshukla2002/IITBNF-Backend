const jwt = require("jsonwebtoken");

const Auth = (req, res, next) => {
  if (!req.header("Authorization")) {
    res.status(400).send({ message: "token not provided" });
    return;
  }
  const token = req.header("Authorization").split(" ")[1];

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (decoded) {
      next();
    } else res.status(400).send({ message: err });
  });
};

module.exports = { Auth };
