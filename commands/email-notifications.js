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
      if (!lastWeekMember.getEmail()) continue;

      let currentWeekMember = secondCircle.find((secondCircleMember) => {
        return secondCircleMember.memberDocument.id === lastWeekMember.memberDocument.id
      });

      new Mailer(
          lastWeekMember.getEmail(),
          await EmailNotifications.compileTemplate(lastWeekMember, currentWeekMember),
          ['Vision report for ', lastWeekMember.getName(), ' | Week #', intervals[1].getWeekNumber()].join('')
      ).sendEmail()
    }
  };

  static async compileTemplate(lastWeekMember, currentWeekMember) {
    let compiledTemplate = pug.compileFile('views/emails/member-notification.pug');
    return compiledTemplate({
      lastWeekReport: lastWeekMember,
      currentWeekReport: currentWeekMember,
      _: require('lodash')
    });
  };

}

module.exports.EmailNotifications = EmailNotifications;
