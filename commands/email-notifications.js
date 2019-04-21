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

  async reportNotification() {
    /**
     * Process last week
     * last week should check if planned is no bigger than fact
     * last week should check if togglEmpty project
     */
    let intervals = await ReportLoaderFactory.getCustomNotificationReport();

    let firstCircle = intervals[0].membersList.getAllMembers();
    let secondCircle = intervals[1].membersList.getAllMembers();


    for (const lastWeekMember of firstCircle) {
      if (lastWeekMember.getEmail()) {
        let currentWeekMember = secondCircle.find((secondCircleMember) => {
          return secondCircleMember.memberDocument.id === lastWeekMember.memberDocument.id
        });

        await EmailNotifications.sendEmailToMember(lastWeekMember, currentWeekMember)
      }
    }
  };

  static async sendEmailToMember (lastWeekReport, currentWeekReport) {
    let compiledTemplate = pug.compileFile('views/emails/member-notification.pug');

    compiledTemplate = compiledTemplate({
      lastWeekReport,
      currentWeekReport,
      _: require('lodash')
    });

    await (new Mailer(lastWeekReport.getEmail(), compiledTemplate)).sendEmail()
  };
}

module.exports.EmailNotifications = EmailNotifications;
