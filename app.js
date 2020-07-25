const url = require("url");
const http = require("http");
const fs = require("fs")
const app = http.createServer((request, response) => {
    fs.readFile(request.url === '/' ? 'frame-player.html' : '.'+request.url, (err, content) => {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end(content, 'utf-8')
        response.end();
    })
});

app.listen(3000);
app.addListener('listening', () => console.log('Server running at http://127.0.0.1:3000'))