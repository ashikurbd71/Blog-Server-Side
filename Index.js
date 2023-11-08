const express = require('express')
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt =require('jsonwebtoken')
var cookieParser = require('cookie-parser')
const app = express()
const port = process.env.PORT || 5000

// midle

app.use(cors({

  origin:['http://localhost:5173','https://phsquarespace.surge.sh'],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())


function verify(req,res,next){

  const token = req?.cookies?.token
  console.log([req,req?.cookies])
  if(!token){

   return res?.status(401).send({message : 'unthorize'})
  }

  jwt.verify(token,process.env.SECRET_KEY,(error,decode) => {
    if(error){
      return  res?.status(401).send({message : 'unthorize'})
      }
    
        req.user = decode
        console.log(decode)
      next()
  })
 
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mtnypra.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
  

    const blogcolaction = client.db("blogDB").collection("blogs");
    const addlist = client.db("blogDB").collection("addblogs");
    const commentlist = client.db("blogDB").collection("comments");


// jwt 

app.post('/jwt',async(req,res) => {

  const body = req.body
  
  const token = jwt.sign(body,process.env.SECRET_KEY,{expiresIn:'2h'})
  console.log("cookie set",token)
  res
  .cookie('token',token,{

    httpOnly:true,
    sameSite:'none',
    secure:true
  })
  .send({token})

})



  // jwt logout

  app.post('/logout',(req,res) => {

    const body = req.body
    console.log(body)
    res
    .clearCookie('token',{maxAge:0})
    .send({sucess: true})
  })


    // get user comment

    app.post('/comments',async(req,res) => {

      try{
        // const blog = req.body
        const blog = req.body;
   
        const result = await commentlist.insertOne(blog)
        res.send(result)
      }
      catch(err){
  
        console.log(err)
      }
  
    })


    // user get all data

    app.get('/comments',async(req,res) => {

     try{
      const result = await commentlist.find().toArray()
      res.send(result)
     }
     catch(err){

      console.log(err)
     }


    })

    // blog post databage
   app.post('/addblog',verify,async(req,res) => {

    try{
      // const blog = req.body
      const blog = req.body;
      blog.createdAt = new Date();
      const result = await blogcolaction.insertOne(blog)
      res.send(result)
    }
    catch(err){

      console.log(err)
    }

   })

// blog get all


app.get('/blogs',async(req,res) => {

   try{
    const result = await blogcolaction
   
    .find()
    .sort({ createdAt: -1 }) 
    .limit(6) 
    .toArray()
    res.send(result)
   }
   catch(err){

    console.log(err)
   }

})

// get all data 

app.get('/allblogs',verify,async(req,res,next) => {
    
  try{
    
    // console.log("ovi",req?.headers)
    // if(req?.user.email !== req.query?.email){

    // return res.status(403).send({message: 'unvelied user'})
    // }
    const result = await blogcolaction
   
    .find()
    .toArray()
    res.send(result)
   }
   catch(err){

    console.log(err)
   }


})


// bloginfo data from add blog


 app.get('/allblogs/:id',async(req,res) => {

   try{
    const id = req.params.id
  const qurey = {_id : new ObjectId(id)}
  const result = await blogcolaction.findOne(qurey)
  res.send(result)
  }

  catch(err) {
  console.log(err)
  }

 })


//  blog data update

app.put('/allblogs/:id',verify,async(req,res) => {

  try{
    const id = req.params.id;
      const data = req.body;
      console.log("id", id, data);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedUSer = {
        $set: {
          title:data?.title,
          short_description: data?.short_description,
          long_description: data?.long_description,
          image: data?.image,
           category: data?.category,
        },
      };
      const result = await blogcolaction.updateOne(
        filter,
        updatedUSer,
        options
      );
      res.send(result);
  }

  catch(err){

    console.log(err)
  }
})

// post add list data

app.post('/addlist',async(req,res) => {
  try{
    const blog = req.body
    blog.createdAt = new Date();
    const result = await addlist.insertOne(blog)
    res.send(result)
  }
  catch(err){

    console.log(err)
  }

})

// addlist data get all

 app.get('/addlist',verify,async(req,res) => {

  const result = await addlist.find().toArray()
  res.send(result)
 })

 //  add get single data

app.get('/addlist/:id',async(req,res) => {

  try{
    const id = req.params.id
  const qurey = {_id : new ObjectId(id)}
  const result = await addlist.findOne(qurey)
  res.send(result)
  }

  catch(err) {
  console.log(err)
  }

})

// addlist data delete()

app.delete('/addlist/:id',async(req,res) => {

 try{
  const id = req.params.id
  const qurey = {_id : new ObjectId(id)}
  const result = await addlist.deleteOne(qurey)
  res.send(result)
 }
 catch(err){

  console.log(err)
 }

})



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Blog Server Runing......!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})