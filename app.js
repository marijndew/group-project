const express = require('express');
const app = express();
const ig = require('instagram-node').instagram();
const port = process.env.PORT || 3000;

//location of our static files(css,js,etc..)
app.use(express.static(__dirname + '/views'));
app.use('/public', express.static(__dirname + '/public'));

//set the view engine to use ejs
app.set('view engine', 'ejs');
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
  ig.authorize_user(req.query.code, redirectUri, function(err, result) {
    if (err) res.send(err);
    // Store this access_token in a global variable
    accessToken = result.access_token;

    // Now the user can be redirected to his account
    res.redirect('/profile');
  });
});

app.get('/profile', (req, res) => {
  if (accessToken === undefined || !accessToken) {
    res.redirect('/')
  }
  // Create a new instance of the use method which contains the access token gotten
  ig.use({
    access_token: accessToken
  });

  ig.user_media_recent(`${accessToken.split('.')[0]}`,
    function(err, result, pagination, remaining, limit) {
      if (err) res.json(err);

      let places = [];

      result.forEach((insta) => {
        if (insta.location && insta.type === "image" || insta.type === "carousel") {
          places.push([insta.images.thumbnail.url, insta.location.latitude, insta.location.longitude])
        }
      });

      res.render('profile', {
        places: places
      })
    });
});


// Manages the log-out button
/*app.get('/logout', (req, res) => {
    if (accessToken.length != 0) {
        accessToken = '';
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});
*/

app.listen(port, console.log(`Eavesdropping on port ${port}`));