

const express   = require( 'express' ),
    app       = express(),
    session   = require( 'express-session' ),
    passport  = require( 'passport' ),
    Local     = require( 'passport-local' ).Strategy,
    bodyParser= require( 'body-parser' ),
ensureLoggedInModule = require('connect-ensure-login');
const helmet = require('helmet');


//const adapter = new FileSync('db.json')
//const db = low( adapter )
//db.defaults({ users:[] }).write()
//db.defaults({ comments:[] }).write()
app.use(express.static(__dirname + '/Public'));
app.use( bodyParser.json() );


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://${DB_USERNAME}:${DB_PW}@a4-vkwta.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
let usersCollection = null;
let commentsCollection = null;
client.connect().then( () => {
    return client.db('A4').createCollection('users'), client.db('A4').createCollection('comments')
}).then(__collection => {
    usersCollection = client.db('A4').collection('users');
    commentsCollection = client.db('A4').collection('comments');
    return usersCollection.find( { } ).toArray()
}).then( console.log );




const getCurrentDayAndTime = function(){
    let currentdate = new Date();
    let datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth()+1)  + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    return datetime
};

function getComments(){
    return commentsCollection.find("").toArray()
}

function addUser(username, password){
    return usersCollection.findOne({username: username})
        .then(result => {
            if(result){
                console.log("Error: user " + username + " already exists");
                return  false
            }
            else {
                return usersCollection.insertOne({username: username, password: password})
                    .then(result => {
                        console.log("Created User: " + username);
                        return true
                    })
                    .catch(err => console.log("An error occurred while making the user"))
            }
        }).catch(err => console.log("An error occurred while looking up the user"))

    /*
        user = db.get('users').find({username: username}).value()
        if(user === undefined){
            db.get('users').push({username: username, password: password}).write()
            console.log("Created User: " + username)
            return true
        }
        console.log("Error: user " + username + "already exists")
        return false

     */
}



function addComment(username, comment){
    let currentTime = getCurrentDayAndTime();
    return commentsCollection.insertOne({id:username+currentTime, username:username, comment:comment, time:currentTime})
        .then(result => {
            return true
        })
        .catch(err => {
            console.log(err);
            return false
        })

    // db.get('comments').push({id:username+currentTime, username:username, comment:comment, time:currentTime}).write()
}

function updateComment(id, username, comment){
    //console.log(comment)
    return commentsCollection.updateOne({id:id}, {$set: {comment:comment}}, { "upsert": false })
        .then()
        .catch(err => {
            console.log(err)
        })


    // let currentTime = getCurrentDayAndTime()
    // db.get('comments').find({id:id}).assign({comment:comment}).write()
    // return true
}

const myLocalStrategy = function(username, password, done){
    //const user = users.find(__user => __user.username === username)

    return usersCollection.findOne({username: username})
        .then(user => {
            if(!user){
                return done(null, false, { message:'user not found' })
            }
            else if(user.password === password){
                return done(null, {username, password})
            }
            else{
                return done(null, false, { message: "Incorrect Password"})
            }
        })
        .catch(err => console.log("Auth Error: " + err))
};

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => {

    /*
    const user = db.get('users').find({username: username}).value()
    */
    usersCollection.findOne({username: username})
        .then(user => {
            if(user){
                console.log("user: " + username );
                done( null, user )
            }
            else {
                console.log("user not logged in!!!");
                done( null, false, { message:'user not found; session not restored' })
            }
        })

    /*
        console.log( 'deserializing:', user )
        if( user !== undefined ) {
            console.log("user: " + username )
            done( null, user )
        }else{
            console.log("user not logged in!!!")
            done( null, false, { message:'user not found; session not restored' })
        }

     */
});

passport.use(new Local(myLocalStrategy));

app.use( session({ secret:'cats cats cats', resave:false, saveUninitialized:false }) );
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());


app.post('/login', passport.authenticate('local', { failWithError: true }
), function(req, res){
    res.json({ status:true})

}, function (req, res){
    console.log("User was unable to login");
    res.json({status:false})

});

app.post('/makeuser', function(req, res){
    const newUsername  = req.body['newUsername'];
    const newPassword = req.body['newPassword'];
    addUser(newUsername, newPassword)
        .then(status => {
            res.json({status: status})
        })
});

app.post('/getComments', function(req, res){
    getComments()
        .then(result =>{
            res.json(result)
        })
        .catch(err => console.log(err))
});

app.post('/newComment', function( req, res ) {
    const username = req.user.username;
    const comment = req.body['comment'];
    console.log(req.user.username);
    addComment(username, comment);
    res.json({ status:'success', username:req.user.username })
});

app.post('/updateComment', function( req, res ) {
    const id = req.body['id'];
    const username = req.user.username;
    const comment = req.body['comment'];
    updateComment(id, username, comment)
        .then(result => {

            getComments()
                .then(result =>{
                    res.json(result)
                })
                .catch(err => console.log(err))
        })
});


app.post('/deletecomment', function( req, res){
    let i = 0;
    let status = 'ok';
    commentsCollection.deleteOne({id: req.body[0].id})
        .then(result => {
            console.log("Removed: " + req.body[0].id)
        })

        .then(result => {
            getComments()
                .then(result => {
                    res.json(result)
                })
                .catch(err => console.log(err))
        })
});

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/Public/index.html' )
});

app.get('/login', function(request, response) {

    response.sendFile( __dirname + '/Public/index.html' )
});

app.get('/secure', ensureLoggedInModule.ensureLoggedIn('/login'), function(req, res){
    //console.log(ensureLoggedInModule.ensureLoggedIn('/login'))
    res.sendFile( __dirname + '/secure/secure.html')
});

app.use( function( req, res, next ) {
    console.log( 'url:', req.url );
    next()
});

app.listen(3000);