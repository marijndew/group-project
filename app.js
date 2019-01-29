const express = require('express'),
    path = require('path'),
    port = process.env.PORT || 3000,
    app = express(),
    ig = require('instagram-node').instagram();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

ig.use({
    client_id: 'f7667a6352a5470098470b4db58cd12e',
    client_secret: '0c12c7680db4438a9d9704493c8c2a12'
});

//the redirect uri we set when registering our application
let redirectUri = 'http://localhost:3000/handleAuth';

//declaring empty accessToken variable
let accessToken = ''

// Log in page
app.get('/', (req, res) => {
    if (accessToken) {
        res.redirect('/profile')
    }
    res.render('index')
})

app.get('/authorize', function (req, res) {
    res.redirect(ig.get_authorization_url(redirectUri));
})

app.get('/handleAuth', function (req, res) {
    //retrieves the code that was passed along as a query to the '/handleAuth' route and uses this code to construct an access token
    ig.authorize_user(req.query.code, redirectUri, function (err, result) {
        if (err) res.send(err);
        // store this access_token in a global variable called accessToken
        accessToken = result.access_token;
        // After getting the access_token redirect to the '/profile' route 
        res.redirect('/profile');
    });
})

app.get('/profile', function (req, res) {
    // create a new instance of the use method which contains the access token gotten
    ig.use({
        access_token: accessToken
    });

    let splitAccessToken = accessToken.split('.')[0]
    console.log(splitAccessToken)

    ig.user_media_recent(splitAccessToken, function (err, result, pagination, remaining, limit) {
        if (err) res.json(err);
        // pass the json file gotten to our ejs template
        res.render('profile', {
            instagram: result
        });
        console.log(result)
    });
});

// listening to port
app.listen(port, (req, res) => {
    console.log(`listening to port ${port}`)
})
