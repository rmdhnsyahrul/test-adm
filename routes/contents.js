const router = require('express').Router();
const passport = require('passport');
const Content = require('../models/contents');

//FIle Upload
const mongoose = require('mongoose');
let Grid = require("gridfs-stream");
let conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
let gfs;


router.get('/', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    Content.find()
        .populate('categories', 'name _id')
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

/*
** post request without uploading file
router.post('/', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const content = new Content({
        name: req.body.name,
        file_url: req.body.file_url,
        brand: req.body.brand,
        categories: req.body.categories
    });
    content
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
*/

router.get('/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const id = req.params.id;
    Content.findOne({ _id: id })
        .populate('categories', 'name _id')
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

/*
** patch request without uploading file
router.patch('/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const id = req.params.id;
    const updatedFields = {};
    for(const field of req.body){
        updatedFields[field.propName] = field.value
    }
    Content.findOneAndUpdate({_id: id}, {$set: updatedFields})
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
*/

router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const id = req.params.id;
    Content.findByIdAndRemove({ _id: id })
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

// router.post('/file', (req, res, next) => {
//     let part = req.files.file;
//     let filename = "files_" + Date.now() + "." + part.name.split('.')[part.name.split('.').length -1];
//     if(!part){
//         return res.json({message: 'Error', error: 'No file(s) found'});
//     }
//     const content = new Content({
//         name: req.body.name,
//         file_url: "http://localhost:3000/content/file/"+filename,
//         brand: req.body.brand,
//         categories: req.body.categories
//     });
//     res.status(201).json({
//         file: filename,
//         content: content
//     });
// });

// fileUpload
conn.once("open", () => {
    gfs = Grid(conn.db);
    router.get('/file/:imgname', (req, res) => {
        gfs.collection('contentFile'); // set collection name to lookup into
        let imgname = req.params.imgname;
        /*
        ** createWriteStream not working on video file type
        gfs.files.find({filename: imgname}).toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).send({
                    message: 'File not found'
                });
            }
            var readstream = gfs.createReadStream({
                filename: files[0].filename
            });
            res.set('Content-Type', files[0].contentType);
            return readstream.pipe(res);
        });
        */
        gfs.files.find({
            filename: imgname
        }).toArray((err, file) => {
            if (err) {
                return res.status(400).json({
                    err: err
                });
            }
            if (!file && file.length === 0) {
                return res.status(404).json({
                    err: 'No se encontró el registro especificado.'
                });
            }
            if (req.headers['range']) {
                var parts = req.headers['range'].replace(/bytes=/, "").split("-");
                var partialstart = parts[0];
                var partialend = parts[1];
    
                var start = parseInt(partialstart, 10);
                var end = partialend ? parseInt(partialend, 10) : file[0].length - 1;
                var chunksize = (end - start) + 1;

                res.writeHead(206, {
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + file[0].length,
                    'Content-Type': file[0].contentType
                });
    
                gfs.createReadStream({
                    filename: file[0].filename,
                    range: {
                        startPos: start,
                        endPos: end
                    }
                }).pipe(res);
            } else {
                res.header('Content-Length', file[0].length);
                res.header('Content-Type', file[0].contentType);
    
                gfs.createReadStream({
                    filename: file[0].filename
                }).pipe(res);
            }
        });
    });

    router.post('/', (req, res) => {
        const categoriesArr = req.body.categories.split(',');
        let part = req.files.file;
        let filename = "files_" + Date.now() + "." + part.name.split('.')[part.name.split('.').length -1];
        if(!part){
            return res.json({message: 'Error', error: 'No file(s) found'});
        }
        let writeStream = gfs.createWriteStream({
            filename: filename,
            mode: 'w',
            content_type: part.mimetype,
            root: "contentFile"
        });
        writeStream.on('close', (file) => {
            if(!file) {
                res.status(400).send('No file received');
            }
            const content = new Content({
                name: req.body.name,
                file_url: "http://localhost:3000/content/file/"+file.filename,
                brand: req.body.brand,
                categories: categoriesArr
            });
            content
                .save()
                .then(result => {
                    res.status(201).json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        });
        // using callbacks is important !
        // writeStream should end the operation once all data is written to the DB 
        writeStream.write(part.data, () => {
          writeStream.end();
        });
    });

    router.post('/file', (req, res) => {
        const selectedCategories = req.body.categories.split(',');
        let part = req.files.file;
        let filename = "files_" + Date.now() + "." + part.name.split('.')[part.name.split('.').length -1];
        if(!part){
            return res.json({message: 'Error', error: 'No file(s) found'});
        }
        let writeStream = gfs.createWriteStream({
            filename: filename,
            mode: 'w',
            content_type: part.mimetype,
            root: "contentFile"
        });
        writeStream.on('close', (file) => {
            if(!file) {
                res.status(400).send('No file received');
            }
            console.log
            const content = new Content({
                name: req.body.name,
                file_url: "http://localhost:3000/content/file/"+file.filename,
                brand: req.body.brand,
                categories: selectedCategories
            });
            content
                .save()
                .then(result => {
                    res.status(201).json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        });
        // using callbacks is important !
        // writeStream should end the operation once all data is written to the DB 
        writeStream.write(part.data, () => {
          writeStream.end();
        });
    });

    router.patch('/:id', passport.authenticate('jwt', {session: false}), (req, res, next) => {
        const id = req.params.id;
        const updatedFields = {};
        for(const field of req.body){
            updatedFields[field.propName] = field.value
        }
        Content.findOneAndUpdate({_id: id}, {$set: updatedFields})
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
});

module.exports = router;