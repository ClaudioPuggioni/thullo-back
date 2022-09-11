const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Enable Cors
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));

// Router Imports
const authRouter = require("./routes/authRoutes");
const boardRouter = require("./routes/boardRoutes");
const cardRouter = require("./routes/cardRoutes");

// const DB_URI = `mongodb+srv://admin:admin@cluster0.rg7pw6b.mongodb.net/?retryWrites=true&w=majority`;
const DB_URI = "mongodb+srv://caunocau:cPoIdHDwdWihVNVn@cluster0.ddq401z.mongodb.net/arrangeMe?retryWrites=true&w=majority";

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to mongodb");
  })
  .catch((err) => console.log("could not connect ", err));

app.use(express.json());
app.use(morgan("dev"));
app.use("/auth", authRouter);
app.use("/board", authenticateRequest, boardRouter);
app.use("/card", authenticateRequest, cardRouter);

app.listen(8000, () => {
  console.log("Connected");
});

function authenticateRequest(req, res, next) {
  const authHeaderInfo = req.headers["authorization"];
  if (authHeaderInfo === undefined) return res.status(401).send("No token  provided");

  const token = authHeaderInfo.split(" ")[1];
  if (token === undefined) return res.status(401).send("Invalid token");

  try {
    const payload = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
    req.userInfo = payload;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
}
