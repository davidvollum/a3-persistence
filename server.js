const users = [
    { username:'charlie', password:'charliee' },
    { username:'moon',    password:'moonmoon' }  
  ]
  

const express   = require( 'express' ),
      app       = express(),
      session   = require( 'express-session' ),
      passport  = require( 'passport' ),
      Local     = require( 'passport-local' ).Strategy,
      bodyParser= require( 'body-parser' ),
      low       = require('lowdb')
      FileSync  = require('lowdb/adapters/FileSync');
      ensureLoggedInModule = require('connect-ensure-login')

const adapter = new FileSync('db.json')
const db = low( adapter )
db.defaults({ users:[] }).write()
db.defaults({ comments:[] }).write()
app.use(express.static('public'))
app.use( bodyParser.json() )

function addUser(username, password){
    user = db.get('users').find({username: username}).value()
    if(user === undefined){
        db.get('users').push({username: username, password: password}).write()
        console.log("Created User: " + username)
        return true
    }
    console.log("Error: user " + username + "already exists")
    return false
}

function addComment(username, comment){
    db.get('comments').push({username:username, comment:comment}).write()
    return true
}

const myLocalStrategy = function(username, password, done){
    //const user = users.find(__user => __user.username === username)
    const user = db.get('users').find({username: username}).value()
    //console.log(dbUser)

    console.log(user)
    if(user === undefined){
        return done(null, false, { message:'user not found' })
    }
    else if(user.password === password){
        console.log("Logged in")
        return done(null, {username, password})
    }
    else{
        return done(null, false, { message: "Inccorect Password"})
    }
}

passport.serializeUser((user, done) => done(null, user.username))
passport.deserializeUser((username, done) => {
    const user = db.get('users').find({username: username}).value()
    console.log( 'deserializing:', user )
    if( user !== undefined ) {
        console.log("user: " + username )
        done( null, user )
    }else{
        console.log("user not logged in!!!")
        done( null, false, { message:'user not found; session not restored' })
    }
})

passport.use(new Local(myLocalStrategy))

app.use( session({ secret:'cats cats cats', resave:false, saveUninitialized:false }) )
app.use(passport.initialize())
app.use(passport.session())


app.post('/login', passport.authenticate('local', { failWithError: true }
), function(req, res){
    res.json({ status:true})

}, function (req, res){
    console.log("User was unable to login")
    res.json({status:false})

})

app.post('/makeuser', function(req, res){
    const newUsername  = req.body['newUsername']
    const newPasword = req.body['newPassword']
    const status = addUser(newUsername, newPasword)
    res.json({ status:status })
})

app.post('/getComments', function(req, res){
    console.log(db.get("comments").value())
    res.json(db.get("comments").value())
})

app.post('/newComment', function( req, res ) {
    const username = req.user.username
    const comment = req.body['comment']
    console.log(req.user.username)
    addComment(username, comment)
    res.json({ status:'success', username:req.user.username })
})

/*
app.get('/appData'), function( req, res){
    
}
*/
app.get('/', function(request, response) {
    console.log("serving http")
    response.sendFile( __dirname + '/public/index.html' )
})

app.get('/login', function(request, response) {
    console.log("serving http")
    response.sendFile( __dirname + '/public/login.html' )
})

app.get('/secure', ensureLoggedInModule.ensureLoggedIn('/login'), function(req, res){
    console.log("requesting file")
    console.log(req.user)
    //console.log(ensureLoggedInModule.ensureLoggedIn('/login'))
    res.sendFile( __dirname + '/secure/secure.html', { user: req.user })
})

app.use( function( req, res, next ) {
    console.log( 'url:', req.url )
    next()
  })

app.listen(3000)