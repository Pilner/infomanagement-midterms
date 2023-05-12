// SETUP
import * as dotenv from "dotenv";
import express from "express";
import {createTable, addData} from "./sqliteFunctions.mjs";

dotenv.config();

const app = express(),
  port = 3000 || process.env.PORT;


app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

// ROUTES
app.get("/", (req, res) => {
  try {
    res.render("home");
  } catch (err) {
    res.render("errorpage");
    console.error(err);
  }
});

app.get("/add", (req, res) => {
  try {
    res.render("addpage")
  } catch (err) {
    res.render("errorpage");
    console.error(err);
  }
});

app.get("/view", (req, res) => {
  try {
    res.render("viewpage")
  } catch (err) {
    res.render("errorpage");
    console.error(err);
  }
});

app.get("/about", (req, res) => {
  try {
    res.render("aboutpage")
  } catch (err) {
    res.render("errorpage");
    console.error(err);
  }
});

app.get("*", (req, res) => {
  res.render("errorpage");
});


app.post("/post-test", (req, res) => {
  console.log('Got body: ', req.body);
  addData(req.body.name, req.body.album, req.body.artist);
});


// LISTEN
app.listen(port, () => {
  console.log(`Server starting on port ${port}`);
})
