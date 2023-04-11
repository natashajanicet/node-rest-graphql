const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const cors = require('cors');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const { createServer } = require('http');
const socket = require('./socket');

const app = express();
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(null, uuid());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use(cors());

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message, data });
});

mongoose
  .connect('mongodb://0.0.0.0:27017/messages?retryWrites=true&w=majority')
  .then((result) => {
    const httpServer = createServer(app);
    const io = socket.init(httpServer);
    io.on('connection', (socket) => {
      console.log('client connected ', socket.id);
    });

    httpServer.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
