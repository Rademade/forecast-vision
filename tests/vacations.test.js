require('dotenv').config();
require('./startup');

const moment = require('moment');
const mongoose = require('mongoose');
const {PeopleHRMember} = require('../services/people-hr/member');
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
      await Member.collection.insertMany([
        {"_id":"5b5ddf5af8ee4c00048c7a95","name":"Alena Panchenko","togglId":"2568766","__v":0,"forecastId":"Q2FyZExpc3RDYXJkOjc2NDE3","team":"5b910a0a637e4900046a1286","actualUtilization":100,"email":"a.pan@rademade.com","peopleHRId":"PW55"},
        {"_id":"5b86954956c6220004e2aa6a","name":"Eugene Larychev","forecastId":"Q2FyZExpc3RDYXJkOjE1MTA5NQ==","__v":0,"togglId":"4288465","team":"5b910a03637e4900046a1284","actualUtilization":100,"email":"el@rademade.com","peopleHRId":"PW100"},
        {"_id":"5b5ddf5af8ee4c00048c7aa5","name":"Igor Korobenko","togglId":"2314402","__v":0,"forecastId":"UGVyc29uOjc2NDM4","team":"5b910a00637e4900046a1282","actualUtilization":100,"email":"ik@rademade.com"}
      ])
    });

    it ('should collect members with PeopleHR id',async  () => {
      let members = await Member.getMembersForHolidaysSync();

      expect(members.length).toEqual(2);

      expect(members.every(memberHasPeoplehrIdString)).toBeTruthy();
    })
  });

  describe('PeopleHRMigration.updateMethodForecastAllocation',() => {
    beforeEach(async () => {
      PeopleHRMigration.prototype.updateForecastAllocation = jest.fn(() => {
        return console.log('update!!!!!!!!!!!!!')
      });

      PeopleHRMigration.prototype.createForecastAllocation = jest.fn(() => {
        return console.log('create!!!!!!!!!!!!!')
      });

      PeopleHRMigration.prototype.deleteForecastAllocation = jest.fn((api, allocationId, csrfToken) => {
        return console.log('delete!!!!!!!!!!!!!')
      });

      ForecastScrapingAuth.mockImplementation(() => {
        return {
          ready: async (callback) => {
            const api = 'api';
            const csrfToken = 'gfgjlnrjegfr33';

            // Todo call calback with aruments api and token
            callback(api, csrfToken)
          },
        };
      });

      await LeaveDay.collection.insertMany([
        {"_id":"5cc01dd09ae62f6b51622845","item":{"AbsenceLeaveTxnId":2964119,"StartDate":"2019-03-14","EndDate":"2019-03-14","DurationDays":"1.00","DurationInDaysThisPeriod":"1.00","PartOfDay":"","BackToWorkInterviewRequried":true,"BackToWorkInterviewDate":"","MedicalCertificateType":1,"MedicalCertificateReceivedDate":"","Reason":"Cold/Flu","Comments":[],"AbsencePaidStatus":1,"EmergencyLeave":false,"ReferenceId":""},"forecastMemberId":"Q2FyZExpc3RDYXJkOjE1MTA5NQ==","forecastProjectId":"UHJvamVjdFR5cGU6NDQ4MzM=","type":0,"status":0,"__v":0},
        {"_id":"5cc01dd09ae62f6b51622847","item":{"AbsenceLeaveTxnId":3189381,"StartDate":"2019-01-14","EndDate":"2019-01-14","DurationDays":"1.00","DurationInDaysThisPeriod":"1.00","PartOfDay":"","BackToWorkInterviewRequried":false,"BackToWorkInterviewDate":"","MedicalCertificateType":0,"MedicalCertificateReceivedDate":"","Reason":"Больничный / Sick leave","Comments":[],"AbsencePaidStatus":2,"EmergencyLeave":false,"ReferenceId":""},"forecastMemberId":"Q2FyZExpc3RDYXJkOjE1MTA5NQ==","forecastProjectId":"UHJvamVjdFR5cGU6NDQ4MzM=","type":0,"status":1,"__v":0},
        {"_id":"5ccec0a8c16ecd1b48cfc0ce","item":{"AbsenceLeaveTxnId":3411150,"StartDate":"2019-04-30","EndDate":"2019-04-30","DurationDays":"1.00","DurationInDaysThisPeriod":"1.00","PartOfDay":"","BackToWorkInterviewRequried":false,"BackToWorkInterviewDate":"","MedicalCertificateType":0,"MedicalCertificateReceivedDate":"","Reason":"Больничный / Sick leave","Comments":[],"AbsencePaidStatus":2,"EmergencyLeave":false,"ReferenceId":""},"forecastMemberId":"UGVyc29uOjc2NDE3","forecastProjectId":"UHJvamVjdFR5cGU6NDQ4MzM=","type":0,"status":2,"__v":0}
      ])
    });

    it ('should loop through leaveDays and call create | update | delete method for allocation', async () => {
      await vacationCommand.updateMethodForecastAllocation();

      expect(ForecastScrapingAuth).toHaveBeenCalledTimes(1);

      expect(vacationCommand.createForecastAllocation).toHaveBeenCalledTimes(1);
      expect(vacationCommand.updateForecastAllocation).toHaveBeenCalledTimes(1);
      expect(vacationCommand.deleteForecastAllocation).toHaveBeenCalledTimes(1);
      // TODO check that mocked functions were called with arguments and date
      // TODO check item with status SHOULD_DELETE is not present in db anymore
    })
  })
});
