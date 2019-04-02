const { LeaveDay } = require('../../models/leave-days');

/**
 * Constants
 * @type {string}
 */
const FORECAST_HOLIDAY_PROJECT_ID = "UHJvamVjdFR5cGU6MTMzNDM=";
const FORECAST_ABSENCE_PROJECT_ID = "UHJvamVjdFR5cGU6NDQ4MzM=";

class LeaveDayItem {
  static async updateLeaveDay (leaveDay, projectID, forecastMemberId) {
    try {
      let leaveDayObject = new LeaveDay({
        item: leaveDay,
        forecastMemberId: forecastMemberId,
        forecastProjectId: projectID
      });

      let leaveDayId = projectID === FORECAST_ABSENCE_PROJECT_ID ? leaveDayObject.item.AbsenceLeaveTxnId : leaveDayObject.item.AnnualLeaveTxnId
      let searchKey = projectID === FORECAST_ABSENCE_PROJECT_ID ? 'item.AbsenceLeaveTxnId' : 'item.AnnualLeaveTxnId';

      let exists = await LeaveDay.find({[searchKey]: leaveDayId});

      if (exists.length < 1) {
        leaveDayObject.set('status', this.NEW_STATUS);

        return await leaveDayObject.save()
      }

      if (exists.length > 0) {
        leaveDayObject.status = this.SHOULD_UPDATE;

        let updated = await LeaveDay.findOneAndUpdate(
          { [searchKey]: leaveDayId },
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
