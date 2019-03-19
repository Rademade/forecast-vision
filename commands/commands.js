const pug = require('pug');
const moment =require('moment');

const { ReportLoaderFactory } = require('../services/report-loader-factory');
const { Mailer } = require('../services/mailer');

const { Member } = require('../models/member');
const { PeopleHRMember } = require('../services/people-hr/member')


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


  for (const member of firstCircle) {
    if (member.getEmail()) {
      let emailData = {
        name: member.getName(),
        email: member.getEmail()
      };

      if (member.getBillableDuration().getMinutes() > member.getFactBillableDuration().getMinutes()) {
        emailData.isBillableNotification = true;

        emailData.lastWeek = {
          planned: member.getBillableDuration().getMinutes(),
          fact: member.getFactBillableDuration().getMinutes()
        }
      }

      if (member.isTasksWithoutProjects()) {
        emailData.isToggleEmptyProject = true
      }

      let currentWeekMember = secondCircle.find(secondCircleMember => secondCircleMember.memberDocument.id === member.memberDocument.id);

      if (currentWeekMember && !currentWeekMember.isNormalBillableHours()) {
        emailData.isForecastEmpty = true;

        emailData.thisWeek = {
          planned: member.getBillableDuration().getMinutes(),
          fact: member.getFactBillableDuration().getMinutes()
        }
      }

      await sendEmailToMember(emailData)
    }
  }
};

const sendEmailToMember = async (emailData) => {
  if (emailData.isBillableNotification || emailData.isToggleEmptyProject || emailData.isForecastEmpty) {
    let compiledTemplate = pug.compileFile('views/emails/member-notification.pug');

    compiledTemplate = compiledTemplate({
      emailData: emailData
    });

    let mailToUser = new Mailer(emailData.email, compiledTemplate);

    await mailToUser.sendEmail();
  }
};

const collectDataPeopleHR = async () => {
  const startDate = moment().subtract(2, 'week').startOf('week');
  const endDate = moment().add(5, 'weeks').startOf('week').subtract(1, 'day');
  /**
   loop through memberList
   */
  let allUsers = await Member.getUserList();

  for (const member of allUsers) {
    if (member.peopleHRId) {
      let peopleHrMember = new PeopleHRMember(startDate, endDate, member)

      let absenceDays = await peopleHrMember.getAbsenceData()
    }
  }
};

module.exports.reportNotification = reportNotification;
module.exports.collectDataPeopleHR = collectDataPeopleHR;



