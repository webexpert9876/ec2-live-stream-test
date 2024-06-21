const express = require('express');
const app = express();
const route = express.Router();
const cors = require('cors');
const path = require('path');

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
const chatBlockedUserRoutes = require('./routes/chatBlockedUserRoutes');
const videoViewRoutes = require('./routes/videoViewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const channelAnalysisRoutes = require('./routes/channelAnalysisRoutes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes');
const channelActivePlanRoutes = require('./routes/channelActivePlanRoutes');
const { isAuthenticatedUser, authorizeRoles } = require('./middlewares/auth')
const errorMiddleware = require('./middlewares/error');
const requestIp = require('request-ip');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var session = require('express-session')
const {googleSignInValidation} = require('./controllers/authenticationController')

app.use(cors());
app.use('/prod', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(requestIp.mw());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_CALLBACK_URL
  },
  googleSignInValidation
));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Routings for api
app.use(route.all('/prod/api/*', isAuthenticatedUser))
app.use(route.all('/prod/api/admin/*', authorizeRoles("admin")))
app.use(route.all('/prod/api/artist/*', authorizeRoles("artist")))
app.use(route.all('/prod/api/artist-admin/*', authorizeRoles("artist", "admin")))
app.use('/prod/auth', authenticationRoutes);
app.use('/prod/public/api', tattooCategoryRoutes);
app.use('/prod/api', userRoute);
app.use('/prod/api', roleRoute);
app.use('/prod/api', channelRoute);
app.use('/prod/api', tattooCategoryRoutes);
app.use('/prod/api', videoRoutes);
app.use('/prod/api', membershipPlanRoutes);
app.use('/prod/api', subscriptionDetailRoutes);
app.use('/prod/api', commentRoutes);
app.use('/prod/api', replyRoutes);
app.use('/prod/api', followerRoutes);
app.use('/prod/api', likeAndDislikeRoutes);
app.use('/prod/api', searchHistoryRoutes);
app.use('/prod/api', videoHistoryRoutes);
app.use('/prod/api', streamRoute);
app.use('/prod/api', playlistRoutes);
app.use('/prod/api', chatMessageRoutes);
app.use('/prod/api', tagRoutes);
app.use('/prod/api', tattooCategoryFollowerRoutes);
app.use('/prod/api', chatBlockedUserRoutes);
app.use('/prod/api', notificationRoutes);
app.use('/prod/api', channelAnalysisRoutes);
app.use('/prod/public/api', videoViewRoutes);
app.use('/prod/api', subscriptionPlanRoutes);
app.use('/prod/api', channelActivePlanRoutes);

app.use(errorMiddleware);

module.exports = app