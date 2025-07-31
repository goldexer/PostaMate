'use strict';

const dbc = require("./controller_Database")
const http = require("http")
const url = require('url');
const crypto = require('crypto');
//crypto.createHash('sha256').update('bacon').digest('hex');

dbc.initUserTable()

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    function BadRequest() {
        console.log("Bad request registered!")
        res.statusCode = 400; res.end();
    }

    function BadCredentials() {
        return (parsedUrl.query?.username?.length < 2 || parsedUrl.query?.userpass?.length < 6);
    }

    //---------------------------- Request info ----------------------------------------------
    console.log("Incoming message... method=" + req.method + " path=" + parsedUrl.pathname)

    if (req.method === 'GET'){
        console.log(parsedUrl.query)


        switch (parsedUrl.pathname) {
            //----------------------- Registration -----------------------------------------------
            case '/processReg': {

                // Server credentials validation
                if (BadCredentials()) { BadRequest(); break; }
                //Good credentials, continue registration
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');

                console.log("good credentials, pass")

                const Hash = crypto.createHash('sha256').update(parsedUrl.query.username + parsedUrl.query.userpass);

                dbc.addUser(parsedUrl.query.username, Hash.digest('hex'), result => {
                    console.log("add user go result = " + result)
                    switch (result) {
                        case 'exists': {
                            res.end(JSON.stringify( {'username': '', 'userpass': '', 'result': 'exists'} ));
                            break;
                        }
                        case 'success': {
                            res.end(JSON.stringify( {'username': '', 'userpass': '', 'result': 'success'} ));
                            break;
                        }
                    }
                })

                res.end(JSON.stringify( { 'username' : parsedUrl.query.username,
                                          'userpass' : parsedUrl.query.userpass,
                                          'error'    : 'none'}
                ));
                break;
            }

            //---------------------- Authorization -----------------------------------------------
            case '/processLog': {
                console.log('Logon request')

                if (BadCredentials()) { BadRequest(); break; }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');

                const Hash = crypto.createHash('sha256').update(parsedUrl.query.username + parsedUrl.query.userpass);

                const requestToken = Hash.digest('hex').toString();

                console.log(requestToken)
                dbc.getUserToken(parsedUrl.query.username, (databaseToken) => {
                    console.log(databaseToken)

                    if (requestToken === databaseToken) {
                        console.log("Есть пользователь!")
                        res.statusCode = 200;
                        res.end(JSON.stringify({
                                'token': databaseToken,
                                'error': 'none'
                            }
                        ));
                    } else {
                        res.statusCode = 200;
                        res.end(JSON.stringify({'error': 'denied'}));
                    }
                })
                break;
            }

            //-------------------- Bad or unusual request ----------------------------------------
            default: BadRequest()
        }
    }
})

server.setTimeout(10000);
server.listen(8000, () => { console.log("Listening on port 8000"); })
