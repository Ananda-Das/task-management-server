const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5000','http://localhost:5176'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
    exposedHeaders: ['Access-Control-Allow-Headers'],
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qfsxze0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // users, admin and moderator related
    const usersCollection = client.db('taskManagerDB').collection('users');
    const taskcollection = client.db('taskManagerDB').collection('task');

    app.get('/addtask', async (req, res) => {
      const result = await taskcollection.find().toArray();
      res.send(result);
    });


    app.post('/addtask', async (req, res) => {
      const taskadd = req.body;
      const data = {
        title: taskadd.title,
        description: taskadd.description,
        date: taskadd.date,
        priority: taskadd.priority,
        status: 'todo',
      };
      const result = await taskcollection.insertOne(data);
      res.send(result);
    });

    app.patch('/status', async (req, res) => {
      const id = req.query.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await taskcollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.delete('/delete', async (req, res) => {
      const id = req.query.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await taskcollection.deleteOne(query);
      res.send(result);
    });

    app.put('/update', async (req, res) => {
      const id = req.query.id;
      const filter = { _id: new ObjectId(id) };
      const data = req.body;
      const updatedDoc = {
        $set: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          deadline: data.deadline,
          email: data.email,
        },
      };
      const result = await taskcollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.post('/task', async (req, res) => {
      const data = req.body;
      const result = await taskcollection.insertOne(data);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Tech On Fire');
});

app.listen(port, () => {
  console.log(`Port is running on: ${port}`);
});
