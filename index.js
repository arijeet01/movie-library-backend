const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");

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
    User.findOne({email: email}, async (err, user) =>{
        if(user){
            const compPass = await bcrypt.compare(password, user.password);
            if(compPass){
                res.send({message: "Login Successfull", user: user});
            }else{
                res.send({message: "Incorrect Credentials!"});
            }
        }else{
            res.send({message: "Incorrect Credentials!"});
        }
    })
});

app.post("/register",async function(req, res){
    const {name, email, password} = req.body;

    const salt = await bcrypt.genSalt(10); 
    const secPassword= await bcrypt.hash(password, salt);

    
    User.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User already registered!"});
        }else{
            const user = new User({
                name,
                email,
                password: secPassword
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

app.listen(9002, function(){
    console.log("Port started at 9002");
});