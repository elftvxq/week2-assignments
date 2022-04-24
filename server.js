const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const headers = require('./headers');
const handleSuccess = require('./handleSuccess.js');
const handleError = require('./handleError.js');
const Posts = require('./models/posts');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

// mongoose
//   .connect(DB)
//   .then(() => {
//     console.log('連線成功');
//   })
//   .catch((error) => {
//     console.log(error);
//   });

mongoose
  .connect('mongodb://localhost:27017/test')
  .then(() => {
    console.log('資料庫連線成功');
  })
  .catch((error) => {
    console.log(error);
  });

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === '/posts' && req.method === 'GET') {
    const allPosts = await Posts.find();
    handleSuccess(res, allPosts);
    res.end();
  } else if (req.url === '/posts' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log(data);
        if (data.content) {
          const newPost = await Posts.create({
            name: data.name,
            content: data.content,
            tags: data.tags,
            type: data.type,
            likes: data.likes,
            image: data.image,
            comments: data.comments,
          });
          handleSuccess(res, newPost);
        } else {
          handleError(res, error);
        }
      } catch (error) {
        handleError(res, error);
      }
    });
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    const posts = await Posts.deleteMany({});
    handleSuccess(res, posts);
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    console.log(id, 'ID');
    const posts = await Posts.findByIdAndDelete(id);

    res.writeHead(200, headers);
    handleSuccess(res, posts);
    res.end();
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const id = req.url.split('/').pop();
        if (data.content !== '') {
          let { content, image, likes, comments } = data;
          const posts = await Posts.findByIdAndUpdate(id, {
            $set: {
              content,
              image,
              likes,
              comments,
            },
          });
          handleSuccess(res, posts);
        } else {
          handleError(res, err);
        }
      } catch (err) {
        handleError(res, err);
      }
    });
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message: '無此網站路由',
      })
    );

    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
