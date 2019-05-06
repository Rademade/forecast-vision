require('dotenv').config();
require('./startup');

const {membersFake, leaveDaysFake } = require('./_fake/data');

const moment = require('moment');
const {PeopleHRMigration} = require('../commands/vacations');
const {LeaveDayItem} = require('../services/leave-days/leave-day-item');
const { LeaveDay } = require('../models/leave-days');
const {ForecastScrapingAuth} = require('../services/forecast/scraping-auth');

jest.mock('../services/forecast/scraping-auth');
/**
 * Models
 */
const {Member} = require('../models/member');


describe('Vacation Command', () => {
  const api = 'api';
  const csrfToken = 'gfgjlnrjegfr33';
  let vacationCommand;

  beforeEach(() => {
    vacationCommand = new PeopleHRMigration();
  });

  afterEach(() => {
    ForecastScrapingAuth.mockClear()
  });


  describe('PeopleHRMigration.updateHolidaysAndAbsence', () => {
    const memberHasPeoplehrIdString = (member) => typeof member.peopleHRId === 'string';

    beforeEach(async() => {
      await Member.collection.insertMany(membersFake)
    });

    it ('should collect members with PeopleHR id',async  () => {
      let members = await Member.getMembersForHolidaysSync();

      expect(members.length).toEqual(2);

      expect(members.every(memberHasPeoplehrIdString)).toBeTruthy();
    })
  });

  describe('PeopleHRMigration.updateMethodForecastAllocation',() => {
    beforeEach(async () => {
      PeopleHRMigration.prototype.updateForecastAllocation = jest.fn();

      PeopleHRMigration.prototype.createForecastAllocation = jest.fn();

      PeopleHRMigration.prototype.deleteForecastAllocation = jest.fn();

      ForecastScrapingAuth.mockImplementation(() => {
        return {
          ready: async (callback) => {
            callback(api, csrfToken)
          },
        };
      });

      await LeaveDay.collection.insertMany(leaveDaysFake)
    });

    it ('should loop through leaveDays and call create | update | delete method for allocation', async () => {
      await vacationCommand.updateMethodForecastAllocation();

      expect(ForecastScrapingAuth).toHaveBeenCalledTimes(1);

      expect(vacationCommand.createForecastAllocation).toHaveBeenCalledTimes(1);
      expect(vacationCommand.updateForecastAllocation).toHaveBeenCalledTimes(1);
      expect(vacationCommand.deleteForecastAllocation).toHaveBeenCalledTimes(1);

      expect(vacationCommand.createForecastAllocation).toHaveBeenLastCalledWith(
        api,
        expect.objectContaining({
          item: leaveDaysFake[0].item
        }),
        csrfToken);

      expect(vacationCommand.updateForecastAllocation).toHaveBeenLastCalledWith(
        api,
        expect.objectContaining({
          item: leaveDaysFake[1].item
        }),
        csrfToken);

      expect(vacationCommand.deleteForecastAllocation).toHaveBeenLastCalledWith(
        api,
        expect.any(String),
        csrfToken);
      // TODO mocks should return promise

      // TODO check item with status SHOULD_DELETE is not present in db anymore
    })
  })

  describe ('PeopleHRMigration._allocationBuilder', () => {
    it ('should create correct dates from db object', () => {
      let allocationObject = PeopleHRMigration._allocationBuilder(leaveDaysFake[0], csrfToken)

      let startDate = moment()
        .set('year', allocationObject.startYear)
        .set('month', allocationObject.startMonth)
        .set('date', allocationObject.startDay)
        .format(LeaveDayItem.DATE_FORMAT);

      let endDate = moment()
        .set('year', allocationObject.endYear)
        .set('month', allocationObject.endMonth)
        .set('date', allocationObject.endDay)
        .format(LeaveDayItem.DATE_FORMAT);

      expect(startDate).toBe(leaveDaysFake[0].item.StartDate);
      expect(endDate).toBe(leaveDaysFake[0].item.EndDate)
    })
  })
});
