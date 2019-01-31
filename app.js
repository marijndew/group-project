const express = require('express'),
    path = require('path'),
    port = process.env.PORT || 3000,
    app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/images', express.static(__dirname + '/images'));

let accessToken = '';

app.get('/', (req, res) => {
    res.redirect('https://api.instagram.com/oauth/authorize/?client_id=f7667a6352a5470098470b4db58cd12e&redirect_uri=http://localhost:3000/handleAuth&response_type=code')
});

app.get('/handleAuth', (req, res) => {
    res.render('index');
})

/*app.post('/handleAuth', (req, res) => {
    let data = {
        "client_id": "f7667a6352a5470098470b4db58cd12e",
        "client_secret": "0c12c7680db4438a9d9704493c8c2a12",
        "grant_type": "authorization_code",
        "redirect_uri": "/handleAuth",
        "code": "req.query.code";
    }
    accessToken = result.access_token;
    res.redirect('/')
})*/

app.get('/map', (req, res) => {
    res.render('map');
})

app.get('/mapcluster', (req, res) => {
    res.render('mapcluster');
})

// listening to port
app.listen(port, (req, res) => {
    console.log(`listening to port ${port}`)
})
