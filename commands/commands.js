/**
 * Libraries
 */
const pug = require('pug');
const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');
const sleep = require('sleep');

/**
 * Services
 */
const { PeopleHRMember } = require('../services/people-hr/member');
const { ReportLoaderFactory } = require('../services/report-loader-factory');
const { ForecastScrapingAuth } = require('../services/forecast/scraping-auth');
const { Mailer } = require('../services/mailer');

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
const MOMENT_FORMAT = 'YYYY-MM-DD';


const getMembersWeeklyReport = async (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    try {
      ReportLoaderFactory.getCustomNotificationReport(startDate, endDate).load((intervalReport) => {
        resolve(intervalReport);
      })
    } catch (error) {
      console.log(error);
      reject(error)
    }
  })
};

const reportNotification = async () => {
  /**
   * Process last week
   * last week should check if planned is no bigger than fact
   * last week should check if togglEmpty project
   */
  let intervals = await getMembersWeeklyReport();

  let firstCircle = intervals[0].membersList.getAllMembers();
  let secondCircle = intervals[1].membersList.getAllMembers();


  for (const lastWeekMember of firstCircle) {
    if (lastWeekMember.getEmail()) {
      let currentWeekMember = secondCircle.find((secondCircleMember) => {
        return secondCircleMember.memberDocument.id === lastWeekMember.memberDocument.id
      });

      await sendEmailToMember(lastWeekMember, currentWeekMember)
    }
  }
};

const sendEmailToMember = async (lastWeekReport, currentWeekReport) => {
  let compiledTemplate = pug.compileFile('views/emails/member-notification.pug');

  compiledTemplate = compiledTemplate({
    lastWeekReport,
    currentWeekReport
  });

  let mailToUser = new Mailer(lastWeekReport.getEmail(), compiledTemplate);

  await mailToUser.sendEmail();
};

const updateHolidaysAndAbsence = async () => {
  const CHUNK_SIZE = 25;
  const SLEEP_TIME = 60;
  const startDate = moment().subtract(5, 'month').startOf('month');
  const endDate = moment().add(5, 'weeks').startOf('week').subtract(1, 'day');

  let peopleHRmembers = await Member.getUserList();

  peopleHRmembers = peopleHRmembers.filter(member => {
    if (member.peopleHRId) {
      return new PeopleHRMember(startDate, endDate, member)
    }
  });

  peopleHRmembers = _.chunk(peopleHRmembers, CHUNK_SIZE);

  for (const chunckMembers of peopleHRmembers) {
    for (member of chunckMembers) {
      if (member) {
        let peopleHrMember = new PeopleHRMember(startDate, endDate, member);

        await peopleHrMember.fetchAbsenceData();
        await peopleHrMember.fetchHolidayData();

        for (absence of peopleHrMember.getAbsenceDays()) {
          await peopleHrMember.updateLeaveDay(absence, FORECAST_ABSENCE_PROJECT_ID)
        }

        for (vacation of peopleHrMember.getHolidaysDays()) {
          await peopleHrMember.updateLeaveDay(vacation, FORECAST_HOLIDAY_PROJECT_ID)
        }
      }
    }

    sleep.sleep(SLEEP_TIME)
  }

  await createForecastAllocation()
};

const createForecastAllocation = async () => {
  const leaveDays = await mongoose.model('LeaveDay').find({});
  const apiLoader = new ForecastScrapingAuth();

  apiLoader.ready(async (api, csrfToken) => {
    for (let day of leaveDays) {
      if (day.isNewAllocation) {
        let response = await api.createAllocation({
          csrfToken: csrfToken,
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
        })

        day.set('isNewAllocation', false);

        await day.save();

        console.log(response)
      }
    }
  })
};

const deleteForecastAllocation = async () => {
  const apiLoader = new ForecastScrapingAuth();

  apiLoader.ready(async (api, csrfToken) => {
    let response = await api.deleteAllocation({
      csrfToken: csrfToken,
      id: 'QWxsb2NhdGlvbjoxNDgxODk='
    })

    console.log(response)
  })
}

module.exports.reportNotification = reportNotification;
module.exports.updateHolidaysAndAbsence = updateHolidaysAndAbsence;



