var http = require('http');
var url = require('url');
var nodemailer = require("nodemailer");

var storenvy_subdomain = 'lostpages';

var bucket = ClientBucket();
var skuData = {};

var port = 8000;

var clients = ClientBucket();

var server = http.createServer(function (req, res) {

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

    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    var query, payload;
    var content = '';
    if ( query = url.parse(req.url, true).query){

        if (query.clientId){
            var client = bucket.findClientById(query.clientId);
            if(client && client.matchToken(query.token)){

                var baseLink = baseUserLink(client);


                content = '<p>Hey '+client.mail()+'</p>' +
                    '<p>This are the content of your bookshelf:</p>' +
                    '<p></p>' +
                    '';

                client.skus().forEach(function(sku){
                    var details = "SKU "+sku+": SKU Details missing";

                    if (skuData[sku]){
                        details = skuData[sku].name;
                    }

                    content += '<p><a href="'+baseLink+"&sku="+sku+'">'+details+'</a></p>';
                });



            }
            else {

            }


        }


    }

    res.end('<img width="320" height="240" style="float: right" src="http://upload.wikimedia.org/wikipedia/commons/2/29/Steppenschuppentier1a.jpg" /> <h1>Lost Pages Bookshelf</h1>' +
        '<p>Our pangolin librarians are working hard to provide you with your documents, as you can see from the picture on the right.</p>' +
        content +
        '<p>If you think you should have received a purchase notification email from Lost Pages, but you haven`t, write to tsojcanth at gmail dot com</p>');
})

var fs = require('fs');
var skuFileName = __dirname + '/sku.json';

if (!fs.existsSync(skuFileName)){
    fs.appendFileSync( skuFileName , JSON.stringify({}) );
}

fs.readFile( skuFileName, function (err, data) {
    if (err) {
        throw err;
    }
    skuData = JSON.parse(data);
    console.log("SKU data loaded, starting server");

    server.listen(port);
    console.log('Server accepting connections at port '+port);
});

//function cookieSet(res){
//    res.setHeader("Set-Cookie", ["language=javascript"]);
//}
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
        html: content // plaintext body
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

process_order(
    {
        email: 'tsojcanth@gmail.com',
        items: [{
            item: {
                sku:1,
                product_name:"test"
            }
        }]
    }
);

function process_order(data){
    var email = data.email;

    console.log(JSON.stringify(data));

    var client = bucket.loadOrCreateClientByMail(email);

    var baseUserUrl = baseUserLink(client);

    var content = '<html><body></html></html>' +
        '<h1>Thank you for your purchase!</h1>' +
        '<p>You can access your purchased documents at <a href="'+baseUserUrl+'">your Lost Lages Bookshelf</a></p>';

    if (data.items.length){
        content +="<h2>New Purchases</h2>";
        data.items.forEach(function(itemEntry){
            var item = itemEntry['item'];
            client.addSKU(item.sku);
            content += '<p><a href="'+baseUserUrl+'&sku='+item.sku+'">'+safe_tags_regex(item["product_name"])+ "</a></p>";
        });
        content += '</body></html>';
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
                console.log("client id "+client.id+" exists");
                client = new Client(mail);
            }
            clients.push(client);
            return client;
        },
        findClientByMail:function (mail){
            return valueIterator(
                clients,
                function(client){
                    if (client.mail() == mail){ return client; }
                }
            );
        },
        findClientById:function (id){
            return valueIterator(
                clients,
                function(client){
                    if (client.Id() == id){ return client; }
                }
            );
        },
        getData: function(){
            var data = {clients:[]};
            clients.forEach(function(client){
                data.clients.push(client.getData());
            });
            return data;
        }
    };
}
function Client(email, id, security_token, skus){
    var id = id || ""+(new Date).getTime()+d(9999);
    var mySkus = skus || [];
    var myToken = security_token || d(99999999);

    return {
        Id: function()              { return id; },
        mail: function()            { return email; },
        addSKU: function (skuNumber){ mySkus.push(skuNumber); },
        matchToken: function(token) { return token == myToken; },
        token: function()           { return myToken; },
        skus: function()            { return mySkus; },
        getData:function()          { return {id:id, skus:mySkus, token:myToken}; }
    }
}


function baseUserLink(client){
    return "http://pangolin.lostpages.co.uk/?clientId="+client.Id()+"&token="+client.token();
}

function d(faces){
    return (Math.floor(Math.random()*faces)+1 );
}

function safe_tags_regex(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}