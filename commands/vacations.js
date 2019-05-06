/**
 * Libraries
 */
const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const sleep = require('sleep');

/**
 * Services
 */
const {PeopleHRMember} = require('../services/people-hr/member');
const {ForecastScrapingAuth} = require('../services/forecast/scraping-auth');
const {LeaveDayItem} = require('../services/leave-days/leave-day-item');

const {HolidayItem} = require('../services/leave-days/holiday-item');
const {AbsenceItem} = require('../services/leave-days/absence-item');

/**
 * Models
 */
const {Member} = require('../models/member');

class PeopleHRMigration {
  constructor () {
    this.startDate = moment().subtract(5, 'month').startOf('month');
    this.endDate = moment().add(5, 'weeks').startOf('week').subtract(1, 'day');
  }

  async updateHolidaysAndAbsence() {
    const CHUNK_SIZE = 25;
    const SLEEP_TIME = 60;

    let members = (await Member.getMembersForHolidaysSync()).map((member) => {
      return new PeopleHRMember(this.startDate, this.endDate, member.peopleHRId, member.forecastId);
    });

    let peopleHrMembers = _.chunk(members, CHUNK_SIZE);

    for (let chunckMembers of peopleHrMembers) {
      for (let peopleHrMember of chunckMembers) {
        const holidaysDays = await peopleHrMember.getHolidaysDays();
        const absenceDays = await peopleHrMember.getAbsenceDays();

        await this.processAbsence(absenceDays,peopleHrMember);
        await this.processDeleted(absenceDays, AbsenceItem, peopleHrMember);

        await this.processHolidays(holidaysDays, peopleHrMember);
        await this.processDeleted(holidaysDays, HolidayItem, peopleHrMember);
      }

      sleep.sleep(SLEEP_TIME)
    }

    await this.updateMethodForecastAllocation();

    console.log('updateHolidaysAndAbsence completed');
  };

  async processHolidays (list, peopleHrMember) {
    for (let vacation of list) {
      let leaveDayInstance =  new LeaveDayItem(vacation, HolidayItem.PROJECT_ID, peopleHrMember.forecastId, HolidayItem.PROJECT_TYPE);

      leaveDayInstance.setStrategy(HolidayItem);

      await leaveDayInstance.update()
    }
  }

  async processAbsence (list, peopleHrMember) {
    for (let absence of list) {
      let leaveDayInstance =  new LeaveDayItem(absence, AbsenceItem.PROJECT_ID, peopleHrMember.forecastId, AbsenceItem.PROJECT_TYPE);

      leaveDayInstance.setStrategy(AbsenceItem);

      await leaveDayInstance.update()
    }
  }

  async processDeleted (list, strategy, circleMemberId) {
    const leaveDays = await mongoose.model('LeaveDay').find({
      'type': strategy.PROJECT_TYPE,
      'item.StartDate': {$gte: this.startDate.format(LeaveDayItem.DATE_FORMAT)}
    });

    for (let day of leaveDays) {
      let leaveDayInstance =  new LeaveDayItem(day.item, strategy.PROJECT_ID, circleMemberId, strategy.PROJECT_TYPE);

      leaveDayInstance.setStrategy(AbsenceItem);

      await leaveDayInstance.markAsShouldDelete(list, circleMemberId)
    }
  }

  async updateMethodForecastAllocation() {
    const leaveDays = await mongoose.model('LeaveDay').find({
      'item.StartDate': {$gte: this.startDate.format(LeaveDayItem.DATE_FORMAT)}
    });
    const apiLoader = new ForecastScrapingAuth();

    apiLoader.ready(async (api, csrfToken) => {
      for (let day of leaveDays) {

        if (parseInt(day.status) === LeaveDayItem.NEW_STATUS) {
          console.log('Create forecast allocation');
          await this.createForecastAllocation(api, day, csrfToken)
        }

        if (parseInt(day.status) === LeaveDayItem.SHOULD_UPDATE) {
          console.log('Update forecast allocation');
          await this.updateForecastAllocation(api, day, csrfToken)
        }

        if (parseInt(day.status) === LeaveDayItem.SHOULD_DELETE) {
          console.log('Deleted forecast allocation');
          await this.deleteForecastAllocation(api, day.forecastAllocationId, csrfToken);
          await day.remove()
        }
      }
    })
  };

  /**
   * Important! get('month') + 1 is needed for forecast api, by default moment get month is zero-indexed!
   */
  static _allocationBuilder(day, token, shouldUpdate) {
    const startDate = moment(day.item.StartDate, LeaveDayItem.DATE_FORMAT);
    const endDate = moment(day.item.EndDate, LeaveDayItem.DATE_FORMAT);

    // TODO extract variables for end and start date. Set strict format
    // IDEA cover this scope with tests
    let output = {
      csrfToken: token,
      endDay: endDate.get('date'),
      endMonth: endDate.get('month') + 1,
      endYear: endDate.get('year'),
      personId: day.forecastMemberId,
      projectId: day.forecastProjectId,
      startDay: startDate.get('date'),
      startMonth: startDate.get('month') + 1,
      startYear: startDate.get('year'),
      sunday: 0,
      monday: 480 * day.item.DurationDays,
      tuesday: 480 * day.item.DurationDays,
      wednesday: 480 * day.item.DurationDays,
      thursday: 480 * day.item.DurationDays,
      friday: 480 * day.item.DurationDays,
      saturday: 0
    };

    if (shouldUpdate) output.id = day.forecastAllocationId;

    return output;
  }

  async createForecastAllocation(api, day, csrfToken) {
    try {
      let response = await api.createAllocation(PeopleHRMigration._allocationBuilder(day, csrfToken));
      day.set('forecastAllocationId', response.data.createAllocation.allocation.node.id);
      await day.save();
    } catch (error) {
      console.log('Raised error on allocation creation');
    }
  }

  async updateForecastAllocation(api, day, csrfToken) {
    try {
      let response = await api.updateAllocation(PeopleHRMigration._allocationBuilder(day, csrfToken, true));
      day.set('forecastAllocationId', response.data.updateAllocation.allocation.id);
      await day.save();
    } catch (error) {
      console.log('Raised error on allocation update');
      await this.createForecastAllocation(api, day, csrfToken);
    }
  }

  async deleteForecastAllocation(api, allocationId, csrfToken) {
    try {
      await api.deleteAllocation({csrfToken: csrfToken, id: allocationId});
    } catch (error) {
      console.log('Raised error on allocation delete');
    }
  }
}

module.exports.PeopleHRMigration = PeopleHRMigration;
