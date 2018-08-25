const router = require('express').Router();
const passport = require('passport');
const Category = require('../models/categories');

/* GET All Categorys */
router.get('/', passport.authenticate('jwt', {session: false}), function(req, res, next) {
    Category.getAllCategories((err, categories) => {
        if (err) return next(err);
        if(!categories) return res.json({success: false, msg: 'Category not found'});
        res.json(categories);
    });
});

/* GET Category BY ID */
router.get('/:id', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Category.findCategoryById(req.params.id, (err, categories) => {
        if (err) return next(err);
        if(!categories) return res.json({success: false, msg: 'Category '+ req.params.id +' not found'});
        res.json(categories);
    });
});

/* SAVE Category */
router.post('/', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Category.addNewCategory(req.body, (err, post) => {
        if (err) return next(err);
        res.json(post);
    });
});

/* UPDATE Category */
router.put('/:id', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Category.updateCategory(req.params.id, req.body, (err, post) => {
        if (err) return next(err);
        Category.findById(req.params.id, (err, result)=>{
            if(err) return next(err);
            if(!result) return res.json({success: false, msg: 'Category '+ req.params.id +' not found'});
            res.json(result);
        })
    });
});

/* DELETE Category */
router.delete('/:id', passport.authenticate('jwt', {session: false}), function(req, res, next){
    Category.deleteCategory(req.params.id, function(err, post){
        if (err) return next(err);
        res.json({success: true, category: post});
    });
});

module.exports = router;