const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/room');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('連線成功');
  })
  .catch((error) => {
    console.log(error);
  });

const postSchema = new mongoose.Schema({});

// Schema 開始
const Post = mongoose.model('post', postSchema);

// const roomSchema = new mongoose.Schema(
//   {
//     name: String,
//     price: {
//       type: Number,
//       required: [true, '價格必填'],
//     },
//     rating: Number,
//     createdAt: {
//       type: Date,
//       default: Date.now,
//       select: false,
//     },
//   },
//   { versionKey: false }
// );

// const Room = mongoose.model('Room', roomSchema);

// Room.create({
//   name: 'Whiteheaven 徵室友',
//   price: 1050,
//   rating: 3,
// });
// const testRoom = new Room(
//   name: 'Queens Town公寓單人房',
//   price: 1100,
//   rating: 3,
// });

// testRoom
//   .save()
//   .then(() => {
//     console.log('新增資料成功');
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  const headers = {
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  };
  console.log(req.url);
  if (req.url == '/rooms' && req.method == 'GET') {
    const rooms = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        rooms,
      })
    );
    res.end();
  } else if (req.url === '/rooms' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log(data);
        const newRoom = await Room.create({
          name: data.name,
          price: data.price,
          rating: data.rating,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
            rooms: newRoom,
          })
        );

        res.end();
      } catch (error) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: 'false',
            rooms: '欄位沒有正確填寫',
            error: error,
          })
        );
        console.log(error);
        res.end();
      }
    });
  } else if (req.url.startWith('/rooms') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    await Post.findByIdAndDelete(id);
    const rooms = await Room.deleteMany({});
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success ',
        data: null,
      })
    );
    res.end();
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(400, headers);
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
