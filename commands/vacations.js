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
const { PeopleHRMember } = require('../services/people-hr/member');
const { ForecastScrapingAuth } = require('../services/forecast/scraping-auth');
const { LeaveDayItem } = require('../services/leave-days/leave-day-item')

/**
 * Models
 */
const { Member } = require('../models/member');

/**
 * Constants
 * @type {string}
 */
const FORECAST_HOLIDAY_PROJECT_ID = "UHJvamVjdFR5cGU6MTMzNDM=";
const FORECAST_ABSENCE_PROJECT_ID = "UHJvamVjdFR5cGU6NDQ4MzM=";

class PeopleHRMigration {

  // TODO split method
  async updateHolidaysAndAbsence () {
    const CHUNK_SIZE = 25;
    const SLEEP_TIME = 60;

    const startDate = moment().subtract(5, 'month').startOf('month');
    const endDate = moment().add(5, 'weeks').startOf('week').subtract(1, 'day');

    let members = (await Member.getMembersForHolidaysSync()).map((member) => {
      return new PeopleHRMember(startDate, endDate, member.peopleHRId, member.forecastId);
    });

    let peopleHrMembers = _.chunk(members, CHUNK_SIZE);

    for (let chunckMembers of peopleHrMembers) {
      for (let peopleHrMember of chunckMembers) {

        // TODO extract absence and holidays processing. 2 separated class and parent class
        const absenceDays = await peopleHrMember.getAbsenceDays();
        const holidaysDays = await peopleHrMember.getHolidaysDays();

        for (let absence of absenceDays) {
          await LeaveDayItem.updateLeaveDay(absence, FORECAST_ABSENCE_PROJECT_ID, peopleHrMember.forecastId)
        }

        for (let vacation of holidaysDays) {
          await LeaveDayItem.updateLeaveDay(vacation, FORECAST_HOLIDAY_PROJECT_ID, peopleHrMember.forecastId)
        }

        const leaveDays = await mongoose.model('LeaveDay').find({});

        for (let day of leaveDays) {
          // TODO separate 2 classes
          let searchKey = day.forecastProjectId === FORECAST_ABSENCE_PROJECT_ID ? 'AbsenceLeaveTxnId' : 'AnnualLeaveTxnId';
          let isDeleted = [...absenceDays, ...holidaysDays].findIndex(fetchedItem => day.item[searchKey] === fetchedItem[searchKey]) < 0;
          let isSameMember = day.forecastMemberId === peopleHrMember.memberDocument.forecastId;

          if (isDeleted && isSameMember) {
            await LeaveDayItem.markAsShouldDelete(day.item[searchKey], searchKey)
          }
        }
      }

      sleep.sleep(SLEEP_TIME)
    }

    await this.updateMethodForecastAllocation()
  };

  async updateMethodForecastAllocation () {
    // TODO we load all leave days. Not just from date range
    const leaveDays = await mongoose.model('LeaveDay').find({});
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

  static _allocationBuilder (day, token, shouldUpdate) {
    let output = {
      csrfToken: token,
      endDay: moment(day.item.EndDate).get('day'),
      endMonth: moment(day.item.EndDate).get('month') + 1,
      endYear: moment(day.item.EndDate).get('year'),
      personId: day.forecastMemberId,
      projectId: day.forecastProjectId,
      startDay: moment(day.item.StartDate).get('day'),
      startMonth: moment(day.item.StartDate).get('month') + 1,
      startYear: moment(day.item.StartDate).get('year'),
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

  async createForecastAllocation (api, day, csrfToken) {
    try {
      let response = await api.createAllocation(PeopleHRMigration._allocationBuilder(day, csrfToken));
      day.set('forecastAllocationId', response.data.createAllocation.allocation.node.id);
      await day.save();
    } catch (error) {
      console.log('Raised error on allocation creation');
    }
  }

  async updateForecastAllocation (api, day, csrfToken) {
    try {
      let response = await api.updateAllocation(PeopleHRMigration._allocationBuilder(day, csrfToken, true));
      day.set('forecastAllocationId', response.data.updateAllocation.allocation.id);
      await day.save();
    } catch (error) {
      console.log('Raised error on allocation update');
      await this.createForecastAllocation(api, day, csrfToken);
    }
  }

  async deleteForecastAllocation (api, allocationId, csrfToken) {
    try {
      await api.deleteAllocation({csrfToken: csrfToken, id: allocationId });
    } catch (error) {
      console.log('Raised error on allocation delete');
    }
  }
}

module.exports.PeopleHRMigration = PeopleHRMigration;
