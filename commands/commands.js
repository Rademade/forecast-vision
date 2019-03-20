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


  for (const lastWeekMember of firstCircle) {
    // FIXME pass only LastWeekMember: member, CurrentWeekMember: currentWeekMember and make all checks inside template, remove from report/memebr methods


    if (lastWeekMember.getEmail()) {
      // TODO avoid additional var. Use currentWeekMemberReport and lastWeekMember report
      // 95 is good planing accuracy
      // TODO move to constant
      // TODO extract method isGoodAccuracy() and isGoodFactReport()
      let currentWeekMember = secondCircle.find((secondCircleMember) => {
        return secondCircleMember.memberDocument.id === lastWeekMember.memberDocument.id
      });

      // TODO extract method isForecastFilled
      // TODO pass member directly to this method
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

module.exports.reportNotification = reportNotification;



