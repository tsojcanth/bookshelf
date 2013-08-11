var http = require('http');
var url = require('url');
var nodemailer = require("nodemailer");

var storenvy_subdomain = 'lostpages';

var bucket = ClientBucket();

var port = 8000;

var clients = ClientBucket();

http.createServer(function (req, res) {

    if (req.method == 'POST') {
        if (req.headers['storenvy-subdomain'] != storenvy_subdomain)    {
            res.end();
            return;
        }


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

    res.end('<h1>Lost Pages Bookshelf</h1>' +
        '<p>Our pangolin librarians are working hard to provide you with your documents.</p>' +
        '<p>If you think you should have received a purchase notification email from Lost Pages, write to tsojcanth at gmail dot com</p>');
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

function deliver_email(recipient, content){
    transport = nodemailer.createTransport("sendmail", {
        path: "/usr/sbin/sendmail"
    });

    console.log("transport created");
    var mailOptions = {
        from: "Lost Pages Bookshelf Pangolin Librarian <paolo@pangolin.lostpages.co.uk>", // sender address
        to: [recipient], // list of receivers
        subject: "New Purchase from Lost Pages",  // Subject line
        text: content // plaintext body
        //html: "<b>Hello world</b>" // html body
    }

// send mail with defined transport object
    transport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log("message failed");
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        transport.close(); // shut down the connection pool, no more messages
    });

}

function process_order(data){
    var email = data.email;

    console.log(JSON.stringify(email,null,2));

    var client = bucket.loadOrCreateClientByMail(email);

    var baseUserUrl = "http://pangolin.lostpages.co.uk/?client="+client.Id()+"&token="+client.token();

    var content = '<h1>Thank you for your purchase!</h1><p>You can access your purchased documents at <a href="'+baseUserUrl+'">your Lost Lages Bookshelf</a></p>';


    if (data.items.length){
        content +="<h2>New Purchases</h2>";
        data.items.forEach(function(item){
            console.log(JSON.stringify(item,null, 2));
            content += '<p><a href"'+baseUserUrl+'&sku='+item.sku+'>'+item["product_name"]+ "</a></p>";
        });
        deliver_email('tsojcanth+RPG@gmail.com',content);
    }

}


function valueIterator(hash, lambda){
    var result;
    for (var key = hash.length ; key-- ;) {
        if ( result = lambda(hash[key],key,hash)){
            return result;
        }
    }
}


function ClientBucket(){
    var clients = [];
    var needsSaved = false;
    return {
        loadOrCreateClientByMail: function(mail){
            var client = this.findClientByMail(mail);
            if (client) return client;

            client = new Client(mail);
            while(this.findClientById(client.Id)){
                client = new Client(mail);
            }
            clients.push(client);
            return client;
        },
        findClientByMail:function (mail){
            return valueIterator(
                function(client){
                    if (client.mail() == mail){ return client; }
                }
            );
        },
        findClientById:function (id){
            return valueIterator(
                function(client){
                    if (client.Id() == id){ return client; }
                }
            );
        }
    };
}
function Client(email){
    var id = ""+(new Date).getTime()+d(9999);
    var skus = [];
    var token = d(99999999);

    return {
        Id: function()              { return id; },
        mail: function()            { return email; },
        addSKU: function (skuNumber){ skus.push(skuNumber); },
        token: function()           { return token; },
        skus: function()            { return skus; }
    }

}

function d(faces){
    return (Math.floor(Math.random()*faces)+1 );
}