const express = require("express");
const cors = require("cors");
const { connection } = require("./database");
const { userModel } = require("./Models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Auth } = require("./Middleware/Auth");

const server = express();

server.use(express.json());
server.use(cors());

server.get("/", Auth, async (req, res) => {
  const { status } = req.query;
  try {
    if (status) {
      const users = await userModel.find({ status });
      res.status(200).send({ users });
    } else {
      const users = await userModel.find();
      res.status(200).send({ users });
    }
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

server.get("/user/:id", Auth, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findOne({ _id: id });
    res.status(200).send({ user });
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

server.post("/signup", async (req, res) => {
  const { email, username } = req.body;

  const userEmailPresent = await userModel.find({ email });
  const userUsernamePresent = await userModel.find({ username });

  if (userUsernamePresent.length > 0) {
    res.status(400).send({ message: "This Username Already Exist" });
    return;
  }

  if (userEmailPresent.length > 0) {
    res.status(400).send({ message: "This Email Already Exist" });
    return;
  }

  try {
    bcrypt.hash(req.body.password, 5, async (err, hash) => {
      if (err) res.status(400).send({ message: err });
      else {
        const user = userModel({ ...req.body, password: hash });
        await user.save();
        res.status(200).send({ message: "Signup Successful" });
      }
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

server.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username === "harshadmin" && password === "harsh12") {
    const token = jwt.sign({ username }, process.env.SECRET);
    res.status(200).send({ message: "Login Success", role: "admin", token });
    return;
  }

  try {
    const user = await userModel.findOne({ username });

    if (!user) {
      res.status(404).send({ message: "this username doesn't exist" });
      return;
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        res.status(400).send({ message: err });
      } else if (result) {
        if (user.status === "pending") {
          res
            .status(200)
            .send({ message: "admin haven't approved your request yet" });
          return;
        }

        if (user.status === "disapproved") {
          res.status(200).send({ message: "your accout is not approved" });
          return;
        }
        const token = jwt.sign({ username }, process.env.SECRET);

        res.status(200).send({
          message: "Login Success",
          token,
          role: "user",
          userId: user._id,
        });
      } else {
        res.status(400).send({ message: "Wrong password" });
      }
    });
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

server.patch("/update/:id", Auth, async (req, res) => {
  const { id } = req.params;

  try {
    await userModel.findByIdAndUpdate({ _id: id }, req.body);
    res.status(200).send({ message: "User Updated" });
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: error });
  }
});

server.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log(
      `server is running in port ${process.env.PORT} and connected to mongoDB`
    );
  } catch (error) {
    console.error(error);
  }
});
