import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import connection from './db/connection.js';

connection
.then(()=> console.log('connected to database successfully'))
.catch((e)=>console.log(e))

const app =express();
app.use(express.json());

const secret = process.env.JWT_SECRET;
const expiration = '2h';
const port = 3001;

app.get('/',(req, res)=>{
    res.send('Welcome to our Authentication Page');
})

app.post('/api/users/register', async (req, res)=>{
    try{
        
        const newUser = await User.create(req.body);
        
        if(!newUser){
            return res.status(400).json({message:"enter valid username or email"})
        }
        const userResponse = newUser.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    }catch(e){
        if(e.code === 11000){
            return res.status(400).json({message:"username or email already in use"});
        }
        if(e.name === 'ValidationError'){
            return res.status(400).json({message: e.message});
        }
       return res.status(500).json(e.message);
    }

});

app.post('/api/users/login', async (req, res)=>{

    try{
        if(!req.body.email || !req.body.password){
            throw new Error('Incomplete Data from request.');
        }
        const user = await User.findOne({email: req.body.email.toLowerCase().trim()})
        if(!user){
            return res.status(400).json({message:"Incorrect email or password"})
        }
        const correctPw = await user.isCorrectPassword(req.body.password);
        if(!correctPw){
            return res.status(400).json({message: "Incorrect email or password"});
        }

        const payload ={
            _id: user._id,
            username:user.username,
            email: user.email
        };
        const token =jwt.sign({data: payload}, secret, {expiresIn: expiration});
        console.log(token);
        return res.json({token, user:payload});
    }catch(e){
        return res.status(400).json(e.message);
    }
});
app.listen(port, ()=>{
    console.log('Server running at http://localhost:'+ port);
})