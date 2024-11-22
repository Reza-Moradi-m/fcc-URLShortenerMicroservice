const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url");
const app = express();

let urlDatabase = []; // Array to store URLs and their corresponding short URLs

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve the HTML file
app.use(express.static("public"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// POST API to shorten the URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Validate the URL
  const parsedUrl = urlParser.parse(originalUrl);
  if (!parsedUrl.protocol || !parsedUrl.hostname) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Check if URL already exists in the database
    const existingUrl = urlDatabase.find((entry) => entry.original_url === originalUrl);
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url,
      });
    }

    // Add a new URL to the database
    const shortUrl = urlDatabase.length + 1;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET API to redirect to the original URL
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl);

  const urlEntry = urlDatabase.find((entry) => entry.short_url === shortUrl);
  if (!urlEntry) {
    return res.json({ error: "No short URL found for the given input" });
  }

  res.redirect(urlEntry.original_url);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
