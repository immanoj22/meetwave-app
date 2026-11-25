import express from 'express';
import path from 'path';
import fileupload from 'express-fileupload';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from "http";
import compression from 'compression';
import config from './Config/config';
import cookieParser from 'cookie-parser';
import initMongoDB from './mongodbConnection';
import UserRoute from './Routes/Routes';
import { Createsocket } from './socket';
import { DecryptData, isEmpty } from './Helper/common';
import helmet from 'helmet';
// import CronController from "./cronController/croncontroller";
import morgan from 'morgan';
import logger from './Config/logger';
import { Server } from 'socket.io';
import User from "./UserController/Models/user_schema";
import Subcategory from "./AdminController/Models/subcategory_schema"


// import EventEmitter from "events";
// const eventEmitter = new EventEmitter();

// Listen

// eventEmitter.on("eventCreated", (data) => {
//     console.log("Event Created:", data);
// });
// eventEmitter.emit("eventCreated", { title: "Cricket is a Match" });
// Emit

// Environment
const MongoURI = config.MONGOURI;
const port = config.PORT || 8008;

export const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(fileupload());

app.use(express.urlencoded({
  extended: false
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('tiny'));
app.use(morgan("combined", {
  "stream": {
    // Configure Morgan to use our custom logger with the http severity
    write: (message) => logger.warn(message.trim())
  }
}));

app.use(async function (req, res, next) {

  // let whitelists = config.FrontUrl
  // let origin = `${req.get('origin')}/` || `${req.protocol}://${req.get('host')}/`
  // console.log("ORIGIN", origin);
  // let Postorigin = `${req.protocol}://${req.get('host')}`

  // console.log("Originsss12345", Postorigin, whitelists, origin, req.url);

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', true);
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  res.header('no-referrer-when-downgrade', '*');
  res.header('no-referrer', '*');
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  var method = req.method;
  console.log(method, req.url);
  // console.log("Originsss", req.get('origin'), req.url, whitelists.indexOf(origin));
  // if (whitelists.indexOf(origin) !== -1) {
  req.url = req.url ? req.url?.split("?")[0] : req.url;
  console.log(req.url, "urllllllll", req.path, req.body);
  if ((method == "GET" || method == "get" || method == "Get") && !['/v1/user/privacy-policy'].includes(req.url)) {
    console.log("reqdata", req.query.data, req.query);
    if (req?.query?.data) {
      req.query = (DecryptData(req?.query?.data));
      // ? DecryptData(req?.query?.data) : req.query;
      return next();
    }
    if (req?.query) {
      req.query = (DecryptData(req?.query))
      // ? DecryptData(req?.query) : req.query;
      return next();
    }
    else return next();
  }
  if ((method == "POST" || method == "post" || method == "Post") && !['/v1/user/revenuecat-webhook'].includes(req.url)) {
    var data = {};
    if (req?.body?.data && Object.keys(req?.body)?.length <= 1) {
      req.body = DecryptData(req?.body?.data);
      // ? DecryptData(req?.body?.data) : req.body;
      console.log("decrypted_decrypted", req.body);
    } else if (!isEmpty(req?.body)) {
      await Promise.all(Object.keys(req?.body).map(async (val) => {
        data[val] = DecryptData(req?.body[val]);
        // ? DecryptData(req?.body[val]) : req?.body[val]
      }))
      req.body = data;
    }
    return next();
  }
  next();

  // }
  // else {
  //   res.json({ status: false, message: "Url something went wrong" })
  // }

});

const server = http.createServer(app);
const io = new Server(server, {
  // transports: ['websocket', 'polling'],
  cors: {
    // origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:8008', 'http://localhost:8008']
    origin: '*'
  },
});

io.use(async function (socket, next) {
  console.info('ADD__ADD', socket.handshake.query?.id);
  socket.id = socket?.handshake?.query?.id;
  let user = socket?.id;
  let resp = await User.findOneAndUpdate({ _id: user }, { $set: { online_status: true, lastSeenDate: new Date() } }, { new: true });
  socket.broadcast.emit("ONLINE_OFFLINE", { userId: user, online_status: true, resp });
  next(); // don't forget this!
});

app.get('/', (req, res) => {
  res.send(
    `Server is Running.`
  )
});
app.use('/v1', UserRoute);

// app.use(() => CronController);

server.listen(port, async (err) => {
  console.log("Server running to the port", port);
  logger.info(`PORT Listening ${port}`);
  if (err) {
    console.log("Sever Failed to Connect", err);
  };
 
  Createsocket(io, app);
  // subscriptionValidateCheck(io, app);
  return initMongoDB(MongoURI);
});

module.exports = app;
// app.listen(port, () => {
//   console.log("Server running to the port", port)
//   initMongoDB(MongoURI)

// }).on('error', (e) => {
//   console.error("Server listen to the port", e)
// })


 