const express = require('express');
const { 
    createPlaylist,
    getAllPlaylistForUser,
    getAllPlaylistForArtist,
    getSinglePlaylistForArtist,
    getSinglePlaylistForUser,
    updatePlaylist,
    deletePlaylist
} = require('../controllers/playlistController');

const routes = express.Router();

// Creates playlist
routes.route('/artist/create/playlist').post(createPlaylist);
// Update, delete, get single playlist for artist
routes.route('/artist/playlist/:id').put(updatePlaylist).get(getSinglePlaylistForArtist).delete(deletePlaylist);
// get all playlist by user id for artist 
routes.route('/artist/all/playlist/:userId').get(getAllPlaylistForArtist);



// get all playlist by user id for user 
routes.route('/all/playlist/:userId').get(getAllPlaylistForUser);
// get single playlist for user
routes.route('/playlist/:id').get(getSinglePlaylistForUser);

module.exports = routes;