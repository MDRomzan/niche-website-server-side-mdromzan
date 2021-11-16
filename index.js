const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId=require("mongodb").ObjectId;
const cors = require("cors");

const admin = require("firebase-admin");
// 
const stripe = require("stripe")('sk_test_51JvntCDJwE53buNKvtOlbspy9d3dY829l9VtdOFKl7jMsHJPDZSlFOItbOlDc0IENOK5dxtfV9agflHmdyTLJMlc00YNzCWVjr');
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
require('dotenv').config()
const port =process.env.PORT || 5000

// middle ware
app.use(cors());
app.use(express.json());

// niche-website-client-side-firebase-adminsdk.json


const productAccount =JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(productAccount)
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ej29o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// console.log(uri);
async function verifyToken(req, res, next){
    if(req.headers?.authorization?.startsWith("Bearer ")){
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
         try{
        const decodedUser= await admin.auth().verifyIdToken(token); 
        req.decodedEmail=decodedUser.email;
  
    }
    catch{

    }
    }
   

    next();
}
async function run(){
    try{
        await client.connect();
        const database =client.db("rdBycycle");
        const exploresCollection=database.collection("explores");
        const orderCollection=database.collection("orders");
        const usersCollection=database.collection("users");
        const orderReviewCollection=database.collection("review");

        // stripe payment method use
        app.post("/create-payment-intent",async(req,res)=>{
            const paymentInfo=req.body;
            const amount=paymentInfo.price*100;
            const paymentIntent=await stripe.paymentIntents.create({
                currency: "usd",
                amount:amount,
                payment_method_types:[
                    "card"
                ]
            });
            res.json({clientSecret: paymentIntent.client_secret})
        })

        // review post 
        app.post("/review",async(req,res)=>{
            const reviewer=req.body;
            console.log("hiiting review",reviewer);
            const result=await orderReviewCollection.insertOne(reviewer);
            console.log(result);
            res.json(result);
        });
        // review get 
        app.get("/review",async(req,res)=>{
            const cursor=orderReviewCollection.find({});
            const review=await cursor.toArray();
            res.json(review);
        })
        // get all data 
        app.get("/explores",async(req,res)=>{
            const cursor=exploresCollection.find({});
            const explores=await cursor.toArray();
            res.send(explores);
        });
        // explore post add 
         // add products post 
            app.post("/explores", async (req, res) => {
                const product = req.body;
                console.log("hiiting the post api", product);
                const result = await exploresCollection.insertOne(product);
                console.log(result);
                res.json(result);
                //res.send("posted hitt")
            });
            // product delete single
            app.delete("/explores/:id",async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result=await exploresCollection.deleteOne(query);
            res.json(result);
        });
        // update product 
        app.put("/explores/:id",async(req,res)=>{
        const id=req.params.id;
        // console.log("updating",req);
        const updateProduct=req.body;
        // // console.log(updateProduct);
        const filter={_id:ObjectId(id)};
        const options ={upsert:true};
        const updateDoc ={
            $set:{
                name:updateProduct.name,
                img:updateProduct.img,
                price:updateProduct.price,
                Description: updateProduct.Description
            },
        };
         const result = await exploresCollection.updateOne(filter,updateDoc,options);
        // console.log("updateing Service ", req);
        res.json(result)
        // res.send("updating not for dating")
    });

        // get single explore
        app.get("/explores/:id",async(req,res)=>{
            const id =req.params.id;
            // console.log(id);
            const query={_id:ObjectId(id)};
            const explore=await exploresCollection.findOne(query);
            // console.log(explore);
            res.json(explore);
        });
            // manage all order
        app.get("/allOrders",async(req,res)=>{
            const cursor=orderCollection.find({});
            const explores=await cursor.toArray();
            res.json(explores);
        });


        // add orders post 
        app.post("/orders",async(req,res)=>{
            const order=req.body;
            console.log("order", order);
            const result=await orderCollection.insertOne(order);
            // console.log(result);
             res.json(result)
        });

        
        // delete order
        app.delete("/deleteOrder/:id",async(req,res)=>{
           const result=await orderCollection.deleteOne({_id:ObjectId(req.params.id),}) ;
           console.log(result);
           res.json(result);
        })
        // orders get database
        app.get("/orders",verifyToken,async (req, res) => {
            const email =req.query.email;
            console.log(email)
            const query ={email:email};
            const cursor=orderCollection.find(query);
            const orders=await cursor.toArray();
            console.log(orders);
            res.json(orders);
        });
        // order payment id 
        app.get("/allOrders/:id",async(req,res)=>{
            const id=req.params.id;
            console.log(id)
            const query= {_id:ObjectId(id)};
            const result=await orderCollection.findOne(query);
            console.log(result);
            res.json(result); 

        })
        // order update status
        app.put("/updateStatus/:id",(req,res)=>{
            const id =req.params.id;
            const updateStatus=req.body.status;
            const filter={_id:ObjectId(id)}
            console.log(updateStatus)
             const result=orderCollection.updateOne(filter,{
                 $set:{status:updateStatus},
             })
             .then(result =>{
                 res.send(result)
             })


        });
        // update payment method
        app.put("/allOrders/:id",async(req,res)=>{
            const id=req.params.id;
            const payment=req.body;
            const filter={_id:ObjectId(id)};
            const updateDoc={
                $set:{
                    payment:payment
                }
            }
            const result=await orderCollection.updateOne(filter,updateDoc);
            console.log(result);
            res.json(result);

        })
        // users collection post hehd
        app.post("/users",async(req,res)=>{
            const user=req.body;
            const result=await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        }); 
        // update login user save database
        app.put("/users",async(req,res)=>{
            const user= req.body;
            // console.log("Put", user);
            const filter={email:user.email}
            const options = { upsert: true };
            const updateDoc ={$set:user};
            const result=await usersCollection.updateOne(filter,updateDoc,options);
            res.json(result);
        });
        // get user admin panel
         app.get("/users/:email",async(req,res)=>{
            const email=req.params.email;
            const query={email:email};
            const user=await usersCollection.findOne(query);
            let isAdmin=false;
            if(user?.role ==="admin"){
                isAdmin=true;
            }
            res.json({admin:isAdmin});
        })
    //    user admin  panel
        app.put("/users/admin",verifyToken,async(req,res)=>{
            const user=req.body;
            //  console.log("Put",req.decodedEmail);
            const requester=req.decodedEmail;
            if(requester){
                const requesterAccount=await usersCollection.findOne({email:requester});
                if(requesterAccount.role==="admin" ){
                    const filter={email:user.email};
                    const updateDoc={$set:{role:"admin"}};
                    const result=await usersCollection.updateOne(filter,updateDoc);
                    console.log(result)
                    res.json(result);

                }

            }
            else{
                res.status(403).json({message:"You do not have access to make Admin"})
            }
            
        })
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