'use strict';

const http = require("http")
const url = require('url');

const server = http.createServer((req, res) => {
        
	res.statusCode = 200;
        res.setHeader('Content-Type', 'application/text');
	res.end("Hello World!");
})

server.setTimeout(10000);
server.listen(8000, () => { console.log("Listening on port 8000"); })
