require('dotenv').config();

const { reportNotification, updateHolidaysAndAbsence } = require('./commands/commands');
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
if (program.sendReport) reportNotification();
if (program.collectHolidays) updateHolidaysAndAbsence();
