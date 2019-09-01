const fs = require("fs");
const express = require("express");
const app = express();

// Setting template engine.
app.set("view engine", "ejs");

app.get("/", (request, response) => response.render("index.ejs"));
app.get("/videos/:filename", (request, response) => {
    const path = `./assets/${request.params.filename}`;
    const info = fs.statSync(path);
    const range = request.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : info.size - 1
        const chunksize = (end - start) + 1
        const file = fs.createReadStream(path, { start, end })
        response.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${info.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        });
        file.pipe(response);
    } else {
        response.writeHead(200, {
            "Content-Type": "video/mp4",
            "Content-Length": info.size
        });

        fs.createReadStream(path).pipe(response);
    }

});

app.listen(3000, () => console.log("Server running in address: http://localhost:3000"));