var mongoose = require('mongoose');
var ContentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    file_url: {type: String, required: true},
    brand: {type: String, required: true},
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true}]
});
const Content = module.exports = mongoose.model('Content', ContentSchema);