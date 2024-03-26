import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    username:{type: 'string', required: true, unique: true},
    password:{type: 'string', required: true},
    role : {type: 'string', required: true}
})

const UserModel= new model("user", UserSchema)

module.exports= UserModel