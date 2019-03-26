const mongoose = require('mongoose');

const leaveDaySchema = new mongoose.Schema({
  item: Object,
  forecastMemberId: String,
  forecastProjectId: String,
  isNewAllocation: {
    type: Boolean,
    required: false
  }
});


const LeaveDay = mongoose.model('LeaveDay', leaveDaySchema)

module.exports.LeaveDay = LeaveDay;
