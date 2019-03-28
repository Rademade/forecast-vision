/**
 * Libraries
 */
const pug = require('pug');

/**
 * Services
 */
const { ReportLoaderFactory } = require('../services/report-loader-factory');
const { Mailer } = require('../services/mailer');

class EmailNotifications {
  async getMembersWeeklyReport (startDate, endDate) {
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

  async reportNotification() {
    /**
     * Process last week
     * last week should check if planned is no bigger than fact
     * last week should check if togglEmpty project
     */
    let intervals = await this.getMembersWeeklyReport();

    let firstCircle = intervals[0].membersList.getAllMembers();
    let secondCircle = intervals[1].membersList.getAllMembers();


    for (const lastWeekMember of firstCircle) {
      if (lastWeekMember.getEmail()) {
        let currentWeekMember = secondCircle.find((secondCircleMember) => {
          return secondCircleMember.memberDocument.id === lastWeekMember.memberDocument.id
        });

        await this.sendEmailToMember(lastWeekMember, currentWeekMember)
      }
    }
  };

  async sendEmailToMember (lastWeekReport, currentWeekReport) {
    let compiledTemplate = pug.compileFile('views/emails/member-notification.pug');

    compiledTemplate = compiledTemplate({
      lastWeekReport,
      currentWeekReport
    });

    let mailToUser = new Mailer(lastWeekReport.getEmail(), compiledTemplate);

    await mailToUser.sendEmail();
  };
}

module.exports.EmailNotifications = EmailNotifications
