const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const session = require("express-session");
const passport= require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(session({
    secret: "a9r8i7j6e5e4t3",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://arijeet_nayak:arinayak01@moviehub.r0tgguf.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true        
},
function(){
    console.log("db connected");
});

const userSchema= new mongoose.Schema({
    name: String,
    username: String,
    password: String,
})

const listSchema = new mongoose.Schema({
    userId: String,
    listname: String,
    privacy: String,
    movielist: [],
    URL: String
})

userSchema.plugin(passportLocalMongoose, {
    selectFields: 'name email'
});

const User = new mongoose.model("User", userSchema);
const List = new mongoose.model("List", listSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/list/public/{listname}", function(){
        //get movielist acc to the list name also there will be a condition which will check whether the list 
        //is public or not
});


app.post("/login", function(req, res){
    const { username, password} = req.body; 

    const user = new User({
        username: username,
        password: password
    })

    req.login(user, function(err){
        if(err){
            res.send({message: "Incorrect Credentials!"});
        }else{
            passport.authenticate("local")(req,res,function(){
                User.findOne({username: username},(err, user) => {
                    if(req.isAuthenticated)
                    res.send({message: "Login Successfull", user: user});
                    else
                    res.send({message: "Incorrect Credentials!"});
                })
               
            });
        }
    });
});

app.post("/register", function(req, res){
    const {name, username, password} = req.body;
    User.register(new User({name, username}), password, function(err, user){
        if(err){
            res.send({message: "Invalid Input, please try again"});
            console.log(err);
        }else{
            res.send( {message: "Successfully Registered! Please Login now."});
        }
    });
    
});

app.post("/createlist", function(req, res){
    const {userId, listname, privacy, movielist}=req.body;
    const newlist = new List({
                    userId: userId,
                    listname: listname,
                    privacy: privacy,
                    movielist: movielist,
                    URL: 'abc'
                })
                List.findOne({'listname' :listname}, function(err, list){
                    if(!err){
                        if(!list){
                            newlist.save(function(err,result){
                                if (err){
                                    console.log(err);
                                }
                                else{
                                    console.log(result);
                                    
                                }
                            });
                        }else{
                            res.send({message: "List already exists"});
                        }
                    }
                })
                
            }
);

app.post("/list", function(req, res){
    const user= req.body;
    List.find({'userId': user._id},function(err, lists){
        //console.log(lists);
        res.send(lists);
    });

});

app.post("/addexisting", function(req, res){
    const {list}=req.body;
    const {movie}=req.body;
   // console.log(list.listname); 
   // console.log(movie);
    List.findOne({'listname': list.listname}, function(err, list){
        list.movielist.push(movie);
        list.save();
    });
});

app.post("/removelist", function(req, res){
    const {movie, user, list} = req.body;
    
    List.findOne({'_id': list._id}, function(err, list){
        list.movielist.pull(movie);
        list.save()
    })
    
    // List.findOne({ 'list.movielist': { $exists: true, $ne: null }}, function(err, empty){
    //     console.log(empty);
    // });
    // List.deleteOne({ 'list.movielist': { $exists: true, $eq: [] } },function(err){})
    //  const emptylist=;
    //  console.log(emptylist);
    // emptylist.deleteOne(function(err){});
});

app.listen(process.env.PORT || 9002, function(){
    console.log("Port started at 9002");
});