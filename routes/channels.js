const router = require('express').Router();
const passport = require('passport');
const Channel = require('../models/channels');

/* GET All Channels */
router.get('/', passport.authenticate('jwt', {session: false}), function(req, res, next) {
    // Channel.getAllChannels((err, channels) => {
    //     if (err) return next(err);
    //     if(!channels) return res.json({success: false, msg: 'Channel not found'});
    //     res.json(channels);
    // });
    Channel.find()
        .populate('playlist', '_id name')
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

/* GET Channel BY ID */
router.get('/:id', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Channel.findChannelById(req.params.id, (err, channel) => {
        if (err) return next(err);
        if(!channel) return res.json({success: false, msg: 'channel '+ req.params.id +' not found'});
        res.json(channel);
    });
});

/* SAVE Channel */
router.post('/', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Channel.addNewChannel(req.body, (err, post) => {
        if (err) return next(err);
        res.json(post);
    });
});

/* UPDATE Channel */
router.put('/:id', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Channel.updateChannel(req.params.id, req.body, (err, post) => {
        if (err) return next(err);
        Channel.findById(req.params.id, (err, result)=>{
            if(err) return next(err);
            if(!result) return res.json({success: false, msg: 'Channel '+ req.params.id +' not found'});
            res.json(result);
        })
    });
});

/* DELETE Channel */
router.delete('/:id', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Channel.deleteChannel(req.params.id, function(err, post){
        if (err) return next(err);
        res.json({success: true, channel: post});
    });
});

/* ASSIGN Playlist to Channel */
router.patch('/:channelId/:playlistId', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Channel.findChannelById(req.params.channelId, (err, post) => {
        if (err) return next(err);
        if(post){
            Channel.assignPlaylistToChannel(post._id, req.params.playlistId, function(err, channel){
                if (err) return next(err);
                if(channel){
                    Channel.findChannelById(channel._id, (err, result)=>{
                        if (err) return next(err);
                        res.status(201).json(result);
                    });
                }
            });
        }
    });
});

module.exports = router;