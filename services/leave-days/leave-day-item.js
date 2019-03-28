const { LeaveDay } = require('../../models/leave-days');

const NEW_STATUS = 'NEW_ALLOCATION';
const SHOULD_UPDATE = 'SHOULD_UPDATE';
const SHOULD_DELETE = 'SHOULD_DELETE';

class LeaveDayItem {
  static async updateLeaveDay (leaveDay, projectID, forecastMemberId) {
    try {
      let leaveDayObject = new LeaveDay({
        item: leaveDay,
        forecastMemberId: forecastMemberId,
        forecastProjectId: projectID
      });

      let exists = await LeaveDay.find({'item.AbsenceLeaveTxnId': leaveDayObject.item.AbsenceLeaveTxnId});

      if (exists.length < 1) {
        leaveDayObject.set('status', NEW_STATUS)

        return await leaveDayObject.save()
      }

      if (exists.length > 0) {
        leaveDayObject.status = SHOULD_UPDATE;

        let updated = await LeaveDay.findOneAndUpdate(
          { 'item.AbsenceLeaveTxnId': leaveDayObject.item.AbsenceLeaveTxnId },
          { status: SHOULD_UPDATE, item: leaveDay},
          { new: true }
        );

        return await updated.save()
      }
    } catch (error) {
      console.log(error)
    }
  }

  static async markAsShouldDelete (peopleHRID) {
    let deletedItem =  await LeaveDay.findOneAndUpdate(
      {'item.AbsenceLeaveTxnId': peopleHRID},
      { status: SHOULD_DELETE},
      { new: true }
      );

    return await deletedItem.save()
  }
}

module.exports.LeaveDayItem = LeaveDayItem;
module.exports.constants = {
  NEW_STATUS,
  SHOULD_UPDATE,
  SHOULD_DELETE
};
