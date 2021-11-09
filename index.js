const express = require('express');
const { MongoClient } = require('mongodb');
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
console.log(uri);

async function run(){
    try{
        await client.connect();
        console.log("Hello Baby How Are Youeee")
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