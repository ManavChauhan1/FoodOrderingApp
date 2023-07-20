const express = require("express");
const app = express();
var cors = require("cors");
app.use(cors());
app.use(express.static("public/build"));
const cookieParser = require("cookie-parser");
app.use(express.json()); //global middleware
require("dotenv").config();
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT} PORT`);
});
app.use(cookieParser());
// if somone comes to /users , /plans or /review , for that we will use routers
// we could have done it by app.get{'./users/....} , but then have to write /users again and again

// these routes are stored Routers folder

const userRouter = require("./Routers/userRouter");
const planRouter = require("./Routers/planRouter");
const reviewRouter = require("./Routers/reviewRouter");
const bookingRouter = require("./Routers/bookingRouter");

app.use("/user", userRouter);
app.use("/plans", planRouter);
app.use("/review", reviewRouter);
app.use("/booking", bookingRouter);
