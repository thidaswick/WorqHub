//fhuRulrGvgJPCjPk
const express = require ("express");
const mongoose = require ("mongoose");

const app = express();

//Middleware
app.use("/",(req, res, next) => {
    res.send("Backend Setup successful");
})

mongoose.connect("mongodb+srv://worqhub:fhuRulrGvgJPCjPk@cluster0.cbor2fj.mongodb.net/")
.then(() => console.log("MongoDB is Connected"))
.then (() => {
    app.listen(5000);
})
.catch((err)=> console.log((err)));