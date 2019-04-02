/**
 * Libraries
 */
const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');
const sleep = require('sleep');

/**
 * Services
 */
const { PeopleHRMember } = require('../services/people-hr/member');
const { ForecastScrapingAuth } = require('../services/forecast/scraping-auth');
const { peopleHRLogger } = require('../logger');
const  { LeaveDayItem } = require('../services/leave-days/leave-day-item')

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
  async updateHolidaysAndAbsence () {
    const CHUNK_SIZE = 25;
    const SLEEP_TIME = 1;
    const startDate = moment().subtract(5, 'month').startOf('month');
    const endDate = moment().add(5, 'weeks').startOf('week').subtract(1, 'day');

    let peopleHRmembers = await Member.getUserList();

    peopleHRmembers = peopleHRmembers.filter(member => {
      if (member.peopleHRId) {
        return new PeopleHRMember(startDate, endDate, member)
      } else {
        peopleHRLogger.info(`Member ${member.name} with id ${member.id} has no peopleHR id`)
      }
    });

    peopleHRmembers = _.chunk(peopleHRmembers, CHUNK_SIZE);

    for (const chunckMembers of peopleHRmembers) {
      for (let member of chunckMembers) {
        if (member) {
          let peopleHrMember = new PeopleHRMember(startDate, endDate, member);
          //
          const absenceDays = await peopleHrMember.getAbsenceDays();
          const holidaysDays = await peopleHrMember.getHolidaysDays();

          for (let absence of absenceDays) {
            await LeaveDayItem.updateLeaveDay(absence, FORECAST_ABSENCE_PROJECT_ID, peopleHrMember.getMemberForecastId())
          }

          for (let vacation of holidaysDays) {
            await LeaveDayItem.updateLeaveDay(vacation, FORECAST_HOLIDAY_PROJECT_ID, peopleHrMember.getMemberForecastId())
          }

          const leaveDays = await mongoose.model('LeaveDay').find({});

          for (let day of leaveDays) {
            let isDeleted = [...absenceDays, ...holidaysDays].findIndex(fetchedItem => day.item.AbsenceLeaveTxnId === fetchedItem.AbsenceLeaveTxnId) < 0;
            let isSameMember = day.forecastMemberId === peopleHrMember.memberDocument.forecastId;

            if (isDeleted && isSameMember) {
              await LeaveDayItem.markAsShouldDelete(day.item.AbsenceLeaveTxnId)
            }
          }
        }
      }

      sleep.sleep(SLEEP_TIME)
    }

    await this.updateMethodForecastAllocation()
  };

  async updateMethodForecastAllocation () {
    const leaveDays = await mongoose.model('LeaveDay').find({});
    const apiLoader = new ForecastScrapingAuth();

    apiLoader.ready(async (api, csrfToken) => {
      for (let day of leaveDays) {
        if (parseInt(day.status) === LeaveDayItem.NEW_STATUS) {
          /**
           * Here call create method
           */

          await this.createForecastAllocation(api, day, csrfToken)
        }

        if (parseInt(day.status) === LeaveDayItem.SHOULD_UPDATE) {
          /**
           * Here call method for update allocation
           */
          await this.updateForecastAllocation(api, day, csrfToken)
        }

        if (parseInt(day.status) === LeaveDayItem.SHOULD_DELETE) {
          /**
           * here call method for delete allcoation
           */
          await this.deleteForecastAllocation(api, day.forecastAllocationId, csrfToken)

          await day.remove()

          console.log(leaveDays)
        }
      }
    })
  };

  _allocationBuilder (day, token, shouldUpdate) {
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

    if (shouldUpdate) {
      output.id = day.forecastAllocationId
    }

    return output
  }

  async createForecastAllocation (api, day, csrfToken) {
    try {
      let response = await api.createAllocation(this._allocationBuilder(day, csrfToken));

      day.set('forecastAllocationId', response.data.createAllocation.allocation.node.id);

      await day.save();

      console.log('success create')
    } catch (error) {
      console.log('error create')
    }
  }

  async updateForecastAllocation (api, day, csrfToken) {
    try {
      let response = await api.updateAllocation(this._allocationBuilder(day, csrfToken, true));

      day.set('forecastAllocationId', response.data.updateAllocation.allocation.id);

      await day.save();

      console.log('success update')
    } catch (error) {
      console.log('allocation was deleted')
      /**
       * If allocation was manually deleted from forecast application doesnt know about this so we should create it
       */
      await this.createForecastAllocation(api, day, csrfToken)
    }
  }

  async deleteForecastAllocation (api, allocationId, csrfToken) {
    try {
      let response = await api.deleteAllocation({
        csrfToken: csrfToken,
        id: allocationId
      });

      console.log('success delete')
    } catch (error) {
      console.log('delete error');
    }
  }
}

module.exports.PeopleHRMigration = PeopleHRMigration;
