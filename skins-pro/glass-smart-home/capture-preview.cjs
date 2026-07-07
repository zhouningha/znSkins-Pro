const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

function serve(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0] || "/");
  const file = path.join(root, urlPath === "/" ? "preview-home.html" : urlPath.replace(/^\//, ""));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
}

const server = http.createServer(serve);

server.listen(8765, "127.0.0.1", async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    await page.goto("http://127.0.0.1:8765/preview-home.html", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const out = path.join(root, "preview-home.png");
    await page.screenshot({ path: out, type: "png" });
    await browser.close();
    console.log(out);
  } finally {
    server.close();
  }
});
