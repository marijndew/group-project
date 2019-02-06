const express = require('express');
const app = express();
const ig = require('instagram-node').instagram();
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const request = require('request');

//location of our static files(css,js,etc..)
app.use(express.static(__dirname + '/views'));
app.use('/public', express.static(__dirname + '/public'));

//set the view engine to use ejs
app.set('view engine', 'ejs');

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(expressSession({
    name: 'userCookie',
    secret: 'secretSignature',
    resave: false,
    saveUninitialized: false
}));

// The redirect uri we set when registering our application
const redirectUri = 'http://localhost:3000/handleAuth';
// The access token retrieved from the authentication process
let accessToken = '';

ig.use({
    client_id: 'f7667a6352a5470098470b4db58cd12e',
    // Find a way to hide it from users
    client_secret: '0c12c7680db4438a9d9704493c8c2a12'
});

app.use((req, res, next) => {

    console.log('Beginning Req.session.user is', req.session.user)
    console.log('Beginning Req.cookies.userCookie is', req.cookies.userCookie)

    if (req.cookies.userCookie && !req.session.user) {
        res.clearCookie('userCookie');
    }
    next();
});


// Log in page
app.get('/', (req, res) => {
    if (req.session.user && req.cookies.userCookie) {
        res.redirect('/profile')
    }
    res.render('index')
})

// Authorization process
app.get('/authorize', (req, res) => {
    if (req.session.user || req.cookies.userCookie) {

        res.redirect('/profile')
    }

    accessToken = '';

    function myFunc() {
        ig.use({
            client_id: 'f7667a6352a5470098470b4db58cd12e',
            // Find a way to hide it from users
            client_secret: '0c12c7680db4438a9d9704493c8c2a12'
        });

        return res.redirect(ig.get_authorization_url(redirectUri));
    }

    myFunc();

});

app.get('/handleAuth', (req, res) => {
    // Retrieves the code that was passed along as a query to the '/handleAuth' route and uses this code to construct an access token
    ig.authorize_user(req.query.code, redirectUri, function (err, result) {
        if (err) res.send(err);
        // Store this access_token in a global variable
        accessToken = result.access_token;

        req.session.user = result.access_token;
        console.log('Req.session.user is', req.session.user)
        console.log('Req.cookies.userCookie is', req.cookies.userCookie)


        // Now the user can be redirected to his account
        res.redirect('/profile');
    });
});

app.get('/handleAuth', (req, res) => {
    // Retrieves the code that was passed along as a query to the '/handleAuth' route and uses this code to construct an access token
    ig.authorize_user(req.query.code, redirectUri, function (err, result) {
        if (err) res.send(err);
        // Store this access_token in a global variable
        accessToken = result.access_token;

        // Now the user can be redirected to his account
        res.redirect('/profile');
    });
});


app.get('/profile', (req, res) => {
    if (!req.session.user || !req.cookies.userCookie) {
        res.redirect('/')
    }
    // Create a new instance of the use method which contains the access token gotten
    ig.use({
        access_token: accessToken
    });

    ig.user_media_recent(`${accessToken.split('.')[0]}`,
        function (err, result, pagination, remaining, limit) {
            if (err) res.json(err);

            let places = [];
            let countryCode = [];

            result.forEach((insta) => {
                if (insta.location && insta.type === "image" || insta.type === "carousel") {

                    places.push([insta.images.thumbnail.url, insta.location.latitude, insta.location.longitude, insta.images.standard_resolution.url])
                }

                let countryURL =
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${insta.location.latitude},${insta.location.longitude}&result_type=country&key=AIzaSyA-ZNLSg6yH-H4rbW7iPI1zT2hjhWUs_pI`

                request(countryURL, function (error, response, body) {
                    console.log('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    /*console.log('body:', body); // Print the HTML for the Google homepage.*/
                    let parseData = JSON.parse(body);
                    let addressComponents = parseData.results[0].address_components[0]
                    let shortName = addressComponents.short_name
                    countryCode.push(shortName)
                    console.log(countryCode)
                });
            });
            console.log(countryCode)
            console.log(places)

            res.render('profile', {
                places: places,
                countryCode: countryCode
            })
        });
});


// GET route for logging out
app.get('/logout', (req, res) => {
    /*req.session.user && req.cookies.userCookie;
    res.clearCookie('userCookie');
    console.log('COOKIE HAS BEEN DELETED');
    res.redirect('https://www.instagram.com/accounts/logout/');*/
    if (req.session.user && req.cookies.userCookie) {
        res.clearCookie('userCookie');
        console.log('COOKIE HAS BEEN DELETED');
        res.redirect('/');
    }
});


app.listen(port, console.log(`Eavesdropping on port ${port}`));
