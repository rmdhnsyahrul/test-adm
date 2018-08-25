var mongoose = require('mongoose');
var playlistSchema = new mongoose.Schema({
    name: {type: String, required: true},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'ContentSchedule'}],
    period: [{type: String, required: true}]
});
const Playlist = module.exports = mongoose.model('Playlist', playlistSchema);

module.exports.getAllPlaylist = function(callback){
    Playlist.find({}, callback)
};
module.exports.createPlaylist = function(playlist, callback){
    Playlist.create(playlist, callback);  
};

module.exports.setContent = function(id, data, callback){
    Playlist.findByIdAndUpdate(id, { items: data }, callback);
};

module.exports.findPlaylistById = function(id, callback){
    Playlist.findById(id, callback);
};