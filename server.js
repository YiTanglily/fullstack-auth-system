const express = require('express')
const cors = require('cors')
const session = require('express-session'); //  install the session
const fs = require('fs'); // for database
const path = require('path'); 
const app = express ()
// those 3 lines are used to set up the code environment.
app.use(express.json())
// translator,otherwise data cannot be retrieved from the front end.
app.use(cors({origin:['http://localhost:5500','http://127.0.0.1:5500'], credentials: true}))  //don't forget the "credentails:true"
// this step is used to connect to the origin of  the front end.


// this is used to set up session.
app.use(session({
    secret: 'hello-my-first-homework', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false  } 
}));
const DATABASE_FILE = './users.json';

// this part is get the data from users. 
function getUsers() {
    if (!fs.existsSync(DATABASE_FILE)) {
        return []; // if the file is unexist, then back to an  empty inventory.
    }
    const data = fs.readFileSync(DATABASE_FILE);
    return JSON.parse(data);
}
//keep the data

function saveUser(user) {
    const users = getUsers(); // get the data
    users.push(user);         // this line is used to add new users.
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(users, null, 2)); // write in the file.
}




// temporary database 
// to set up the api of the register and login 
app.post('/register',(req,res) =>{
    const  {username,password,telephone} =req.body;
    const users = getUsers();
    const exists = users.find(user => user.username === username);
    if(exists){
        return res.json({ success:false,message:' Username already exists'});
    }
// save the new users data.
    saveUser({username,password,telephone}) ;

// the line above is used to check for duplicate username.
    console.log(" New user registered and saved to the file:",username)//show the log 
    res.json({success:true,message:'registration successful!'});   // provide the info to front end user.
} );

app.post('/login',(req,res)=>{
    const {username,password} =req.body;
    const users= getUsers();

    const user =users.find(user=>user.username===username && user.password===password);   //this line is used to match the data of username and password in user=[].
    if(user){
        req.session.user = user;
        res.json({success:true,message:"welcome"});
    }
    else{res.json({success:false,message:"username or password incorrect"});}

});
//check the user'status
app.get('/user-status', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, username: req.session.user.username });
    } else {
        res.json({ loggedIn: false });
    }
});

// log out action
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: "Your Account Logged Out" });
});
app.listen(3000,() =>console.log('The server is running'));