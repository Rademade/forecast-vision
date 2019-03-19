const pug = require('pug');

const { ReportLoaderFactory } = require('../services/report-loader-factory');
const { Mailer } = require('../services/mailer');

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
      // TODO avoid additional var. Use currentWeekMemberReport and lastWeekMember report
      // 95 is good planing accuracy
      // TODO move to constant
      // TODO extract method isGoodAccuracy() and isGoodFactReport()
      if (member.isGoodAccuracy() && member.isGoodFactReport()) {
        member.setEmailNotificaions('isBillableNotification', true)

        member.setLastWeekReport({
          planned: member.getPlanningBillablePercent(),
          fact: member.getFactBillablePercent()
        })
      }

      if (member.isTasksWithoutProjects()) {
        member.setEmailNotificaions('isToggleEmptyProject', true)
      }

      let currentWeekMember = secondCircle.find((secondCircleMember) => {
        return secondCircleMember.memberDocument.id === member.memberDocument.id
      });

      // TODO extract method isForecastFilled
      if (currentWeekMember && !currentWeekMember.isNormalBillableHours()) {
        member.setEmailNotificaions('isForecastEmpty', true)

        member.setCurrentWeekReport({
          planned: currentWeekMember.getPlanningBillablePercent()
        })
      }

      // TODO pass member directly to this method
      await sendEmailToMember(member)
    }
  }
};

const sendEmailToMember = async (member) => {
  let compiledTemplate = pug.compileFile('views/emails/member-notification.pug');

  compiledTemplate = compiledTemplate({
    member: member
  });

  let mailToUser = new Mailer(member.getEmail(), compiledTemplate);

  await mailToUser.sendEmail();
};

module.exports.reportNotification = reportNotification;



