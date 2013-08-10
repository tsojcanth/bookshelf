var http = require('http');
var url = require('url');
var nodemailer = require("nodemailer");

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


                process_order(POSTDATA);


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

function deliver_email(recipient){
    var transport = nodemailer.createTransport("sendmail");

    var mailOptions = {
        from: "Paolo - Lost Pages Bookshelf Pangolin Slave ✔ <tsojcanth@gmail.com>", // sender address
        to: [recipient], // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world ✔", // plaintext body
        html: "<b>Hello world ✔</b>" // html body
    }

// send mail with defined transport object
    transport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });

}

function process_order(data){
    var email = data.email;
    console.log(JSON.stringify(email,null,2));

    if (data.items.length){
        data.items.forEach(function(item){
            console.log(JSON.stringify(item,null, 2));
        })
    }
}
