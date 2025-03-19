require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Pinecone_router = require('./routes/Pinecone_router');

const PORT = process.env.PORT || 4000;
const app = express()
app.use(cors({ origin: '*' }));
app.use(express.json());  
app.use(bodyParser.json());

app.use('/pinecone', Pinecone_router);



const start = async () => {
  try {
      app.listen(PORT, () => {
        console.log(`Сервер работает на порту ${PORT}`);
      });
  } catch (e) {
      console.log('Error starting server:', e);
  }
};

start();