var mongoose = require('mongoose');
var ContentScheduleSchema = new mongoose.Schema({
    items: {type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true},
    schedule: {
        days: [{type: Number, required: true}],
        dates: [{type: Number, required: true}],
        times: [{type: String, required: true}],
        periods: [{type: String, required: true}]
    }
});
const ContentSchedule = module.exports = mongoose.model('ContentSchedule', ContentScheduleSchema);

module.exports.insertSchedule = function(scheduleList, callback){
    ContentSchedule.insertMany(scheduleList, callback);
};