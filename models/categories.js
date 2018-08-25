const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    updated_at: {type: Date, default: Date.now}
});
const Category = module.exports = mongoose.model('Category', CategorySchema);
module.exports.getAllCategories = function(callback){
    Category.find({}, callback)
};
module.exports.findCategoryById = function(id, callback){
    Category.findById(id, callback);
};
module.exports.addNewCategory = function(category, callback){
    Category.create(category, callback);
};
module.exports.updateCategory = function(id, category, callback){
    Category.findByIdAndUpdate(id, category, callback);
};
module.exports.deleteCategory = function(id, callback){
    Category.findByIdAndRemove(id, callback);
};