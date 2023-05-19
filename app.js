// SETUP
import * as dotenv from "dotenv";
import express from "express";
import {addData, allData, searchData} from "./sqliteFunctions.mjs";

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
    res.render("addpage");
  } catch (err) {
    res.render("errorpage");
    console.error(err);
  }
});

app.get("/view", async (req, res) => {
  try {
    let searchItem = req.query.search;
    if (searchItem) {
      const rows = await searchData(req.query.search);
      res.render("viewpage", {rows: rows, placeholder: searchItem});
    } else {
      const rows = await allData();
      res.render("viewpage", {rows: rows, placeholder: searchItem});
    }

  } catch (err) {
    res.render("errorpage");
    console.error(err);
  }
});

app.get("/about", (req, res) => {
  try {
    res.render("aboutpage");
  } catch (err) {
    res.render("errorpage");
    console.error(err);
  }
});

app.get("*", (req, res) => {
  res.render("errorpage");
});


app.post("/post-test", async (req, res) => {
  console.log('Got body: ', req.body);
  await addData(req.body.name, req.body.album, req.body.artist, req.body.composer, req.body.time, req.body.price);
  res.redirect("/view")
});


// LISTEN
app.listen(port, () => {
  console.log(`Server starting on port ${port}`);
})
