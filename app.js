const express = require('express');
const app = express();
const route = express.Router();
const cors = require('cors');

const userRoute = require('./routes/userRoute');
const roleRoute = require('./routes/roleRoutes');
const channelRoute = require('./routes/channelRoute');
const authenticationRoutes = require('./routes/authenticationRoutes');
const tattooCategoryRoutes = require('./routes/tattooCategoryRoutes');
const videoRoutes = require('./routes/videoRoutes');
const membershipPlanRoutes = require('./routes/membershipPlanRoutes');
const subscriptionDetailRoutes = require('./routes/subscriptionDetailRoutes');
const commentRoutes = require('./routes/commentRoutes');
const replyRoutes = require('./routes/replyRoutes');
const followerRoutes = require('./routes/followerRoutes');
const likeAndDislikeRoutes = require('./routes/likeAndDislikeRoutes');
const searchHistoryRoutes = require('./routes/searchHistoryRoutes');
const videoHistoryRoutes = require('./routes/videoHistoryRoutes');
const streamRoute = require('./routes/streamRoute');
const playlistRoutes = require('./routes/playlistRoutes');
const chatMessageRoutes = require('./routes/chatMessageRoutes');
const tagRoutes = require('./routes/tagRoute');
const tattooCategoryFollowerRoutes = require('./routes/tattooCategoryFollowerRoutes');
const { isAuthenticatedUser, authorizeRoles } = require('./middlewares/auth')
const errorMiddleware = require('./middlewares/error');

app.use(cors());
app.use(express.json());

// Routings for api
app.use(route.all('/api/*', isAuthenticatedUser))
app.use(route.all('/api/admin/*',authorizeRoles("admin")))
app.use(route.all('/api/artist/*',authorizeRoles("artist")))
app.use(route.all('/api/artist-admin/*',authorizeRoles("artist", "admin")))
app.use('/auth', authenticationRoutes);
app.use('/public/api', tattooCategoryRoutes);
app.use('/api', userRoute);
app.use('/api', roleRoute);
app.use('/api', channelRoute);
app.use('/api', tattooCategoryRoutes);
app.use('/api', videoRoutes);
app.use('/api', membershipPlanRoutes);
app.use('/api', subscriptionDetailRoutes);
app.use('/api', commentRoutes);
app.use('/api', replyRoutes);
app.use('/api', followerRoutes);
app.use('/api', likeAndDislikeRoutes);
app.use('/api', searchHistoryRoutes);
app.use('/api', videoHistoryRoutes);
app.use('/api', streamRoute);
app.use('/api', playlistRoutes);
app.use('/api', chatMessageRoutes);
app.use('/api', tagRoutes);
app.use('/api', tattooCategoryFollowerRoutes);

app.use(errorMiddleware);

module.exports = app