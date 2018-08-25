const mongoose = require('mongoose');
const ChannelSchema = new mongoose.Schema({
    name: String,
    playlist: {type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', default: null},
    updated_at: {type: Date, default: Date.now}
});
const Channel = module.exports = mongoose.model('Channel', ChannelSchema);
module.exports.getAllChannels = function(callback){
    Channel.find({}, callback)
};
module.exports.findChannelById = function(id, callback){
    Channel.findById(id, callback);
};
module.exports.addNewChannel = function(channel, callback){
    Channel.create(channel, callback);
};
module.exports.updateChannel = function(id, channel, callback){
    Channel.findByIdAndUpdate(id, channel, callback);
};
module.exports.deleteChannel = function(id, callback){
    Channel.findByIdAndRemove(id, callback);
};
module.exports.assignPlaylistToChannel = function(channelId, playlistId, callback){
    Channel.findByIdAndUpdate(channelId, {$set: {playlist:playlistId}}, callback);
};