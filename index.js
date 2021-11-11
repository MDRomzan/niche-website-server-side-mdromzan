const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId=require("mongodb").ObjectId;
const cors = require("cors");
const app = express();
require('dotenv').config()
const port =process.env.PORT || 5000

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ej29o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// console.log(uri);

async function run(){
    try{
        await client.connect();
        const database =client.db("rdBycycle");
        const exploresCollection=database.collection("explores");
        const orderCollection=database.collection("orders");
        const usersCollection=database.collection("users");
        // get all data 
        app.get("/explores",async(req,res)=>{
            const cursor=exploresCollection.find({});
            const explores=await cursor.toArray();
            res.send(explores);
        });
        // get single explore
        app.get("/explores/:id",async(req,res)=>{
            const id =req.params.id;
            console.log(id);
            const query={_id:ObjectId(id)};
            const explore=await exploresCollection.findOne(query);
            console.log(explore);
            res.json(explore);
        });
        // add orders post 
        app.post("/orders",async(req,res)=>{
            const order=req.body;
            // console.log("order", order);
            const result=await orderCollection.insertOne(order);
            console.log(result);
            // res.json(result)
        });
        // add all users database
       
    }
    finally{
        // await cliant.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Hello Bycycle ON!')
})

app.listen(port, () => {
    console.log(`Bycycle Website Is On:${port}`)
})