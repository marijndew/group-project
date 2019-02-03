const express = require('express');
const app = express();
const ig = require('instagram-node').instagram();
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

//location of our static files(css,js,etc..)
app.use(express.static(__dirname + '/views'));

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
/*app.use((req, res, next) => {
    if (req.cookies.userCookie && !req.session.user) {
        res.clearCookie('userCookie');
    }
    next();
});*/



// The redirect uri we set when registering our application
const redirectUri = 'http://localhost:3000/handleAuth';
// The access token retrieved from the authentication process
let accessToken = '';

ig.use({
    client_id: 'f7667a6352a5470098470b4db58cd12e',
    // Find a way to hide it from users
    client_secret: '0c12c7680db4438a9d9704493c8c2a12'
});

// Log in page
app.get('/', (req, res) => {
    if (accessToken) {
        res.redirect('/profile')
    }
    res.render('index')
})

// Authorization process
app.get('/authorize', (req, res) => {
    if (accessToken) {
        res.redirect('/profile')
    }
    accessToken = '';
    res.redirect(ig.get_authorization_url(redirectUri));
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
    if (accessToken === '' || !accessToken && req.cookies.userCookie) {
        res.redirect('/')
    }
    // Create a new instance of the use method which contains the access token gotten
    ig.use({
        access_token: accessToken
    });
    console.log(`Your access token is ${accessToken}`);

    ig.user_media_recent(`${accessToken.split('.')[0]}`,
        function (err, result, pagination, remaining, limit) {
            if (err) res.json(err);
            // pass the json file retrieved to our ejs template
            console.log(result[0].user.full_name);
            res.render('profile', {
                instagram: result
            });
        });
});

// GET route for logging out
app.get('/logout', (req, res) => {
    req.session.user && req.cookies.userCookie;
    res.clearCookie('userCookie');
    console.log('COOKIE HAS BEEN DELETED');
    res.redirect('https://www.instagram.com/accounts/logout/');
});


app.listen(port, console.log(`Eavesdropping on port ${port}`));
