const express = require("express");
 // import handler from "./api/abc";
// Initialize Express
const app = express();

// Create GET request
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});
app.get("/api/abc",(req,res)=>{
    res.status(200).json({
        body: "request.body",
        query: "request.query",
        cookies: "request.cookies",
      });
})

// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});

module.exports = app;