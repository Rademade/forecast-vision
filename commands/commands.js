const { MemberReport } = require('../services/member-report');
const { Mailer } = require('../services/mailer');
const pug = require('pug');
const moment = require('moment');
const _ = require('lodash');

const NORMAL_BILLABLE_PERCENTAGE = 80;

let userMails = {};



const reportNotification = async () => {
  /**
   * Proccess last week
   */
  let members = await new MemberReport().getMembersWeeklyReport(
    moment().subtract(1, 'week').startOf('week'),
    moment().subtract(1, 'week').endOf('week')
  );

  for (const member of members) {
    let email = member.memberDocument.email;

    if (email) {
      if (!userMails[email]) userMails[email] = { name: member.memberDocument.name };

      userMails[email].lastWeek = {};

      userMails[email].lastWeek.planned = await memberLoadPlan(member);
      userMails[email].lastWeek.fact = await memberLoadFact(member);

      if (userMails[email].lastWeek.planned > userMails[email].lastWeek.fact) {
        userMails[email].isBillableNotification = true
      }

      if (isTogglEmptyProject(member)) {
        userMails[email].isToggleEmptyProject = true
      }
    }
  }

  /**
   * Proccess this week
   */
  members = await new MemberReport().getMembersWeeklyReport(
    moment().startOf('week'),
    moment().endOf('week')
  );

  for (const member of members) {
    let email = member.memberDocument.email;

    if (email) {
      if (!userMails[email]) userMails[email] = { name: member.memberDocument.name };

      userMails[email].thisWeek = {};

      userMails[email].thisWeek.planned = await memberLoadPlan(member);
      userMails[email].thisWeek.fact = await memberLoadFact(member);

      if (userMails[email].thisWeek.planned < NORMAL_BILLABLE_PERCENTAGE) {
        userMails[email].isForecastEmpty = true
      }
    }
  }

  await sendEmailToMember()
};

const memberLoadFact = async (member) => {
  let percentage = await new MemberReport().getBillablePercentFact(member);

  return percentage
};

const memberLoadPlan = async (member) => {
  let percentage = await new MemberReport().getBillablePercentPlan(member);

  return percentage
};

const isTogglEmptyProject = async (member) => {
  const isEmpty = await new MemberReport().isTaskWithoutProject(member);

  return isEmpty
};

const sendEmailToMember = async () => {
  _.forEach(userMails, async (value, key) => {
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



