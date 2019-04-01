const { LeaveDay } = require('../../models/leave-days');

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
        leaveDayObject.set('status', this.NEW_STATUS);

        return await leaveDayObject.save()
      }

      if (exists.length > 0) {
        leaveDayObject.status = this.SHOULD_UPDATE;

        let updated = await LeaveDay.findOneAndUpdate(
          { 'item.AbsenceLeaveTxnId': leaveDayObject.item.AbsenceLeaveTxnId },
          { status: this.SHOULD_UPDATE, item: leaveDay},
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
      { status: this.SHOULD_DELETE},
      { new: true }
      );

    return await deletedItem.save()
  }
}

LeaveDayItem.NEW_STATUS = 0;
LeaveDayItem.SHOULD_UPDATE = 1;
LeaveDayItem.SHOULD_DELETE = 2;

module.exports.LeaveDayItem = LeaveDayItem;
