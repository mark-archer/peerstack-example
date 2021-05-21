const http = require('http');
const fs = require('fs');
const connectionsServer = require('peerstack/dist/connections-server');

// set up a simple http server which returns `index.html` for any route
const server = http.createServer(function (req, res) {  
  fs.readFile('./index.html', 'utf-8', (err, html) => {
    if (err) html = String(err);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html)
    res.end();
  });
});

// set up signalling server
connectionsServer.init(server);

// start server on designated port
const port = 7777;
server.listen(port);
console.log(`server running at http://localhost:${port}/`)
