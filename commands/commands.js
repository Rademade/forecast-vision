const { Mailer } = require('../services/mailer');
const pug = require('pug');
const moment = require('moment');
const _ = require('lodash');

const { ReportLoaderFactory } = require('../services/report-loader-factory');



let notifications = {};

const getMembersWeeklyReport = async (startDate, endDate) => {
  let membersList = [];

  return new Promise((resolve, reject) => {
    try {
      ReportLoaderFactory.getMonthReport(startDate, endDate).load((intervalReport) => {
        _.forEach(intervalReport[0].membersList.items, (value, key) => {
          membersList.push(value)
        });

        resolve(membersList);
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
  let members = await getMembersWeeklyReport(
    moment().subtract(1, 'week').startOf('week'),
    moment().subtract(1, 'week').endOf('week')
  );

  for (const member of members) {
    if (member) {
      if (!notifications[member.getEmail()]) notifications[member.getEmail()] = { name: member.getName() };

      notifications[member.getEmail()].lastWeek = {};
      notifications[member.getEmail()].lastWeek.planned = member.getBillableDuration().minutes;
      notifications[member.getEmail()].lastWeek.fact = member.getFactBillableDuration().minutes;

      if (notifications[member.getEmail()].lastWeek.planned > notifications[member.getEmail()].lastWeek.fact) {
        notifications[member.getEmail()].isBillableNotification = true
      }

      if (member.isTasksWithoutProjects()) {
        notifications[member.getEmail()].isToggleEmptyProject = true
      }
    }
  }

  /**
   * Proccess this week
   * should check if week planned is lower than NORMAL_BILLABLE_PERCENTAGE
   */
  members = await getMembersWeeklyReport(
    moment().startOf('week'),
    moment().endOf('week')
  );

  for (const member of members) {
    if (member) {
      if (!notifications[member.getEmail()]) notifications[member.getEmail()] = { name: member.getName() };

      notifications[member.getEmail()].thisWeek = {};
      notifications[member.getEmail()].thisWeek.planned = member.getBillableDuration().minutes;
      notifications[member.getEmail()].thisWeek.fact = member.getFactBillableDuration().minutes;


      if (!member.isNormalBillableHours()) {
        notifications[member.getEmail()].isForecastEmpty = true
      }
    }
  }

  await sendEmailToMember()
};

const sendEmailToMember = async () => {
  _.forEach(notifications, async (value, key) => {
    if (value.isBillableNotification || value.isToggleEmptyProject || value.isForecastEmpty) {
      let compiledTemplate = pug.compileFile('views/emails/member-notification.pug');

      compiledTemplate = compiledTemplate({
        emailData: value
      });

      let mailToUser = new Mailer(key, compiledTemplate);

      await mailToUser.sendEmail();
    }
  });
};

module.exports.reportNotification = reportNotification;



