const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');

const graphqlResolver = require('./graphql/resolvers');
const graphqlSchema = require('./graphql/schema');
const auth = require('./middleware/auth');

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

app.use(auth);

app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated');
  }

  if (!req.file) {
    return res.status(200).json({ message: 'No file provided' });
  }

  if (req.body.oldPath) {
    clearImage(req, body, oldPath);
  }
  res.status(201).json({ message: 'File stored', filePath: req.file.path.replace('\\', '/') });
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true, // to enable graphql playground
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }

      const data = err.originalError.data;
      const message = err.message || 'An error occured';
      const code = err.originalError.code || 500;

      return { message, status: code, data };
    },
  })
);

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
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });

const clearImage = (filePath) => {
  filePath = path.join(__dirname, filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
