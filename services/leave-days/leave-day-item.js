class LeaveDayItem {
  constructor (leaveDay, projectID, forecastMemberId, type) {
    this.leaveDay = {
      item: leaveDay,
      forecastMemberId: forecastMemberId,
      forecastProjectId: projectID,
      type: type
    }
  }

  setStrategy (strategy) {
    this.strategy = strategy
  }

  async update () {
    await this.strategy.updateLeaveDay(this.leaveDay)
  }

  async markAsShouldDelete (APIItems, circleMemberId) {
    await this.strategy.isDeleted(this.leaveDay, APIItems, circleMemberId)
  }
}

LeaveDayItem.NEW_STATUS = 0;
LeaveDayItem.SHOULD_UPDATE = 1;
LeaveDayItem.SHOULD_DELETE = 2;

module.exports.LeaveDayItem = LeaveDayItem;
