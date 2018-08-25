var http = require('http');
function onRequest(req, res){
    res.writeHead(200, {'Content-Type':'text/html'});
    res.render('./index.html');
    res.end();
}
http.createServer(onRequest).listen(8000);