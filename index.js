const express = require("express");
const app = express();
const path = require("path");
const routes = require("./routes/routes");

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(routes);

// app.get("/*.html", (req, res) => {
//   const fileName = req.params[0];
//   res.sendFile(path.join(__dirname, "public", "frontend", `${fileName}.html`));
// });

app.use("/", express.static(path.join(__dirname, "public", "frontend")));

app.get("/", (req, res) => {
  res.redirect("login.html");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
