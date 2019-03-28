
/**
 * Services
 */
const { EmailNotifications } = require('./email-notifications');
const { PeopleHRMigration } = require('./vacations');




const runMemberNotification = async () => {
  await new EmailNotifications().reportNotification()
};

const runPeopleHRMigration = async () => {
  await new PeopleHRMigration().updateHolidaysAndAbsence()
};


module.exports.reportNotification = runMemberNotification;
module.exports.updateHolidaysAndAbsence = runPeopleHRMigration;



