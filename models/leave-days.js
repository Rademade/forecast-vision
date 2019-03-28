const mongoose = require('mongoose');

const leaveDaySchema = new mongoose.Schema({
  item: Object,
  forecastMemberId: String,
  forecastProjectId: String,
  forecastAllocationId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false
  }
});


const LeaveDay = mongoose.model('LeaveDay', leaveDaySchema);

module.exports.LeaveDay = LeaveDay;
