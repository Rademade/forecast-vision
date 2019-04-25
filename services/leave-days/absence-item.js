const { LeaveDay } = require('../../models/leave-days');
const { LeaveDayItem } = require('./leave-day-item');

class AbsenceItem {
  static async updateLeaveDay (dayItem) {
    let leaveDayObject = new LeaveDay(dayItem);

    let exists = await LeaveDay.find({'item.AbsenceLeaveTxnId': dayItem.item.AbsenceLeaveTxnId});

    if (exists.length < 1) {
      leaveDayObject.set('status', LeaveDayItem.NEW_STATUS);

      return await leaveDayObject.save()
    }

    if (exists.length > 0) {
      leaveDayObject.status = LeaveDayItem.SHOULD_UPDATE;

      let updated = await LeaveDay.findOneAndUpdate(
        { 'item.AbsenceLeaveTxnId': dayItem.item.AbsenceLeaveTxnId },
        { status: LeaveDayItem.SHOULD_UPDATE, item: dayItem.item},
        { new: true }
      );

      return await updated.save()
    }
  }

   static async isDeleted (dayItem, APIItems, circleMemberId) {
    let isDeleted = APIItems.findIndex(fetchedItem => dayItem.item.AbsenceLeaveTxnId === fetchedItem.AbsenceLeaveTxnId) < 0;
    let isSameMember = dayItem.forecastMemberId === circleMemberId;

    if (isDeleted && isSameMember) {
      await this.markAsShouldDelete(dayItem)
    }
  }

  static async markAsShouldDelete (dayItem) {
    let deletedItem =  await LeaveDay.findOneAndUpdate(
      {'item.AbsenceLeaveTxnId': dayItem.item.AbsenceLeaveTxnId},
      { status: LeaveDayItem.SHOULD_DELETE},
      { new: true }
    );

    return await deletedItem.save()
  }
}

AbsenceItem.PROJECT_ID = "UHJvamVjdFR5cGU6NDQ4MzM=";
AbsenceItem.PROJECT_TYPE = 0;

module.exports.AbsenceItem = AbsenceItem
