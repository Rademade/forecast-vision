require('dotenv').config();

const {EmailNotifications} = require('./commands/email-notifications');
const {PeopleHRMigration} = require('./commands/vacations');

const { startServer } = require('./server');

const mongoose = require('mongoose');
const program = require('commander');

mongoose.connect([
    process.env.MONGODB_URI || 'mongodb://localhost:27017/forecast',
].join(''), { useNewUrlParser: true });



program
    .version('0.1.0')
    .option('--start', 'Start application')
    .option('--send-report', 'Send reports')
    .option('--collect-holidays', 'Collect holidays and absence days')
    .parse(process.argv);

if (program.start) startServer();
if (program.sendReport) {
    (async () => {
        await new EmailNotifications().reportNotification()
    })()
}

if (program.collectHolidays) {
    (async () => {
        await new PeopleHRMigration().updateHolidaysAndAbsence()
    })()
}
