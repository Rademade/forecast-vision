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
      let emailData = {
        name: member.getName(),
        email: member.getEmail()
      };

      // 95 is good planing accuracy
      // TODO move to constant
      // TODO extract method isGoodAccuracy() and isGoodFactReport()
      if (member.getPlanningAccuracyPercent() > 95 && member.getFactBillablePercent() < 80) {
        emailData.isBillableNotification = true;

        emailData.lastWeek = {
          planned: member.getPlanningBillablePercent(),
          fact: member.getFactBillablePercent()
        }
      }

      if (member.isTasksWithoutProjects()) {
        emailData.isToggleEmptyProject = true
      }

      let currentWeekMember = secondCircle.find((secondCircleMember) => {
        return secondCircleMember.memberDocument.id === member.memberDocument.id
      });

      // TODO extract method isForecastFilled
      if (currentWeekMember && !currentWeekMember.isNormalBillableHours()) {
        emailData.isForecastEmpty = true;

        emailData.thisWeek = {
          planned: currentWeekMember.getPlanningBillablePercent()
        }
      }

      // TODO pass member directly to this method
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

module.exports.reportNotification = reportNotification;



