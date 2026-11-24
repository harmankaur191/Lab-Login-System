import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import connection from './db/connection.js';

connection
.then(()=> console.log('connected to database successfully'))
.catch(()=>console.log(e))

const app =express();
app.use(express.json());

const secret = process.env.JWT_SECRET;
const port = 3001;

app.get('/',(req, res)=>{
    res.send('Welcome to our Authentication Page');
})

app.post('/api/users/register', async (req, res)=>{
    try{
        const newUser = await User.create(req.body);
        res.send(newUser);
    }catch(e){
        res.status(500).json(e.message);
    }

})
app.listen(port, ()=>{
    console.log('Server running at http://localhost:'+ port);
})