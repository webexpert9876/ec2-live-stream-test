const app = require('./app');
const dotenv = require('dotenv');
const nms = require('./media-server');
const databaseConnect = require('./config/databaseConfig');
const http = require('http');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const resolvers = require('./graphql/resolver');
const typeDefs = require('./graphql/schema');
const { GraphQLError } = require('graphql');

// requiring sockets event handlers
const socketEventHandler = require('./controllers/socketController');

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Config env file
dotenv.config({path: './config/.env'});

// Connect to database
databaseConnect();

// Created node server
const httpServer = http.createServer(app);


// The GraphQL Connection function
async function startApolloServer(typeDefs, resolvers) {

  // Set up Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true
  });
  
  await apolloServer.start()
  
  app.use('/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        // Checking user is authenticated or not
        // if (req.get('Authorization') != 'maria-live-stream'){
        //   throw new GraphQLError('User is not authenticated', {
        //     extensions: {
        //       code: 'UNAUTHENTICATED',
        //       http: { status: 401 },
        //     },
        //   });
        // }
        // token: req.headers.token 
      },
    })
  );

  // await new Promise((resolve) => {
  //   console.log(resolve)
  //   // expressServer = app.listen({ port: process.env.SERVER_PORT }, resolve)
  //   // console.log(`Express app is working on http://localhost:${process.env.SERVER_PORT}`);
  //   // console.log(`GraphQl is working on http://localhost:${process.env.SERVER_PORT}/graphql`);
  // });

}

// Calling graphql connection function
startApolloServer(typeDefs, resolvers);


// Server listening on ports
const expressServer = app.listen({ port: process.env.SERVER_PORT }, ()=>{
  console.log(`Express app is working on http://localhost:${process.env.SERVER_PORT}`);
  console.log(`GraphQl is working on http://localhost:${process.env.SERVER_PORT}/graphql`);
  console.log(`Socket io listening on ${process.env.SERVER_PORT}`)
});


// Created socket connection
const io = require('socket.io')(expressServer, {
  cors: {
      origin: "*",
      // origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      // allowedHeaders: ["my-custom-header"],
      // credentials: false,
  }
});

// Creating socket connection
io.on('connection', (socket) => {

  socketEventHandler.handleRoomJoining(socket);
  socketEventHandler.handleStreamChat(socket);
  socketEventHandler.handleLeaveStreamChat(socket);
  socketEventHandler.handleSocketDisconnect(socket);
  socketEventHandler.handleLiveStreamViewerCount(socket);

});


// Running node media server
nms.run();

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  expressServer.close(() => {
    process.exit(1);
  });
});