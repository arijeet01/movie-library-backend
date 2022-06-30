const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());


mongoose.connect("mongodb://localhost:27017/movieDB",{
    useNewUrlParser: true,
    useUnifiedTopology: true        
},
function(){
    console.log("db connected");
});

const userSchema= new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const User = new mongoose.model("User", userSchema);

app.post("/login", function(req, res){
    const { email, password} = req.body; 
    User.findOne({email: email}, (err, user) =>{
        if(user){
            if(password === user.password){
                console.log("Success!");
                res.send({message: "Login Successfull", user: user});
            }else{
                console.log("Password Incorrect!");
                res.send({message: "Password Incorrect!"});
            }
        }else{
            console.log("user not found!");
            res.send({message: "User not registered"});
        }
    })
});

app.post("/register", function(req, res){
    const {name, email, password} = req.body;
    console.log(req.body);
    User.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User already registered!"});
        }else{
            const user = new User({
                name,
                email,
                password
            })
            user.save( err => {
                if(err){
                    res.send(err)
                }else{
                    res.send( {message: "Successfully Registered! Please Login now."});
                }
            })
        }
    })

    
});

// app.post("/home", function(req, res){
//     res.send
// })

app.listen(9002, function(){
    console.log("Port started at 9002");
});