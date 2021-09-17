const express = require('express');
const fs = require('fs');

const app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// This endpoint will get called by the html - video tag!
app.get("/video", function(req, res) {
    const range = req.headers.range;
    console.log(req.headers);
    
    if(!range) {
        res.status(400).send("Requires a Range header!");
    }

    // Get video stats
    // const videoPath = "THIS IS YOUR VIDEO PATH";     
    const videoPath = "vid.mp4";
    const videoStats = fs.statSync(videoPath);

    console.log(videoStats);

    const videoSize = videoStats.size;

    // Parse Range
    // Ex: "bytes=32324-"
    const CHUNK_SIZE = 10**6; // 1 MB Chunk!
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize-1);

    const contentLength = end-start+1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Range": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    };

    // 206: Partial response!
    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, {start, end});

    videoStream.pipe(res);
});

app.listen(3000, () => {
    console.log('listening on 3000');
})