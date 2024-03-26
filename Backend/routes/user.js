const router = require('express')();
const UserModel = require('../Models/User')
const BookModel = require('../Models/Book');

//getProfile
//borrow book
//return Book
//login
//logout

const omitPassword =(user)=>{
  const {password , ...rest}= user;
  return rest;
}


router.post('/login', async (req, res) => {
    console.log(req);
    const {username, password} = req.body;
    const User= await UserModel.findOne({username: username,});
    // User not exist
    if(User===null){
        return res.status(404).json(message :"User not found");
    }
    if(password!==User.password){
        return res.status(400).json({message :"Invalid Credentials"});
    }
    req.session.username = username;
    return res.status(200).json({user:omitPassword(User)});

})

router.get('/getProfile',async (req,res ,)=>{
    try{

        const username = req.session.username;
        const user= await UserModel.findOne({username: username});
        if(user===null){
            return res.status(404).json({message:'User not Found'});
        }
        else{
            return res.status(200).json({user:omitPassword(user)});
        }
    }
    catch(err){
        next(err);
    }
})

router.get('/logout' , (req, res , next)=>{
    try{
        req.session.destroy();
        return res.status(204).json({message:'Logged out successfully'});
    }
    catch(err){
        next(err);
    }
});
//Burrow Book
router.get('/borrow-books', (req, res, next)=>{
    //check if book exist
    //If exists check book is available 
    // Check if he has already borrowed that book 
    //if available update book quantity and borrowed by param
    try{
        const {isbnId}= req.body;
        const book = BookModel.find({isbn:isbnId});
        const username = req.session.get('username');
        const user = BookModel.find({username: username});
        if(book===null){ // such book doesn't exist
            return res.status(404).json({message:"Book doesn't exist"});
        }
        if(book.burrowedBy.includes(user)){
            return res.status(400).json({message:'You have already borrowed that book'});
        }
        if(book.availableQunatity>0){
            book.availableQunatity=book.availableQunatity-1;
            book.borrowedBy.push(user);
            book.save();
            return res.status(200).json({book:book});
        }
    }
    catch(err){
        next(err);
    }

    // add User

})

router.post('/return', (req,res,next)=>{
    try{
        const {isbnId}= req.body;
        const username = req.session.username

        const book = BookModel.findOne({isbn:isbnId});
        const user = UserModel.findOne({username:username});

        if(book===null){
            return res.status(404).json({message:'Book not found'});
        }
        if(user===null){
            return res.status(404).json({message:'User not found'});
        }
        // If user borrwed that book or not 
        if(!book.borrowedBy.includes(user)){
            return res.status(400).json({message:'Book  not borrowed from user'});
        }

        book.burrowedBy=book.burrowedBy.filter(obj=>obj.username!=username)
        book.availableQunatity=book.availableQunatity+1;
        book.save();
        return res.status(200).json({book:book});
        
    }
    catch(err){
        next(err)
    }
})
module.exports ={router};