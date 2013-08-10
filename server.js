var http = require('http');
var url = require('url');

var port = 8000;


http.createServer(function (req, res) {

    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var payload = '';
            try {

                var POSTDATA = JSON.parse(body);

                console.log(POSTDATA);

                POSTDATA.mode = POSTDATA.mode || {};

                //payload = JSON.stringify(POSTDATA);

            }
            catch (e) {
            }

            res.end(payload);
        });
        return;
    }

    //var cookies = cookiesReceived(req);
    //cookieSet(res);


    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    var query, payload;
    if ( query = url.parse(req.url, true).query){
        payload = JSON.stringify(query);


        if ()
        if (query.mail){
            //send mail


        }


    }

    res.end('Hey\n'+payload);
}).listen(port);
console.log('Server accepting connections at port '+port);


function cookieSet(res){
    res.setHeader("Set-Cookie", ["language=javascript"]);
}

function cookiesReceived(request){
    var cookies = {};
    request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    return cookies;
}