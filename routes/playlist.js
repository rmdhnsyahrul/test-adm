const router = require('express').Router();
const passport = require('passport');
const Playlist = require('../models/playlist');
const ContentSchedule = require('../models/content_schedule');

router.get('/', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    Playlist.getAllPlaylist((err, playlist) => {
        if (err) return next(err);
        if(!playlist) return res.json({success: false, msg: 'playlist not found'});
        res.json(playlist);
    });
    /*
    Playlist.find()
        .populate({
            path: 'items',
            model: 'ContentSchedule',
            populate: {
                path: 'items',
                model: 'Content',
                populate: {
                    path: 'categories',
                    model: 'Category'
                }
            }
        })
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
        */
});

/*
router.post('/', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    var newPlaylist = {
        name: req.body.name,
        schedule: {
            period: req.body.period,
        }
    }
    Playlist.createPlaylist(newPlaylist, (err, playlist) => {
        if (err) return next(err);
        var tmpScheduleList = [];
        for(var i=0; i<req.body.contents.length;i++){
            tmpScheduleList.push({
                items: req.body.contents[i].content_id,
                schedule: {
                    days: req.body.contents[i].content_schedule.days,
                    dates: req.body.contents[i].content_schedule.dates,
                    times: req.body.contents[i].content_schedule.times,
                    periods: req.body.contents[i].content_schedule.periods
                }
            });
        }
        ContentSchedule.insertMany(tmpScheduleList, (err, contentSchedule) => {
            if (err) return next(err);
            var tmpContentList = [];
            for(var i=0;i<contentSchedule.length;i++){
                tmpContentList.push(contentSchedule[i]._id);
            }
            Playlist.setContent(playlist._id, tmpContentList, (err, result) => {
                if (err) return next(err);
                Playlist.findPlaylistById(playlist._id, (err, result)=>{
                    if(err) return next(err);
                    if(!result) return res.json({success: false, msg: 'Playlist '+ playlistId +' not found'});
                    res.json(result);
                    res.end();
                });
            });
        });
        
    });
});
*/
router.post('/', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    var tmpScheduleList = [];
    for(var i=0; i<req.body.items.length;i++){
        tmpScheduleList.push({
            items: req.body.items[i].content_id,
            schedule: {
                days: req.body.items[i].content_schedule.days,
                dates: req.body.items[i].content_schedule.dates,
                times: req.body.items[i].content_schedule.times,
                periods: req.body.items[i].content_schedule.periods
            }
        });
    }
    ContentSchedule.insertMany(tmpScheduleList, (err, contentSchedule) => {
        if (err) return next(err);
        var newPlaylist = {
            name: req.body.name,
            items: [],
            period: req.body.period
        }
        for(var i=0;i<contentSchedule.length;i++){
            newPlaylist.items.push(contentSchedule[i]._id);
        }
        Playlist.createPlaylist(newPlaylist, (err, playlist) => {
            if (err) return next(err);
            Playlist.findPlaylistById(playlist._id, (err, result)=>{
                if(err) return next(err);
                if(!result) return res.json({success: false, msg: 'Playlist '+ playlistId +' not found'});
                res.json(result);
                res.end();
            });
        });
    });
});

router.get('/:id', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    // Playlist.findPlaylistById(req.params.id, (err, playlist) => {
    //     if(err) return next(err);
    //     res.status(200).json(playlist);
    //     res.end();
    // });
    Playlist.findById({_id:req.params.id})
        .populate({
            path: 'items',
            model: 'ContentSchedule',
            populate: {
                path: 'items',
                model: 'Content',
                populate: {
                    path: 'categories',
                    model: 'Category'
                }
            }
        })
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

module.exports = router;