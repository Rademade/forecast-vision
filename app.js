require('dotenv').config();

const { reportNotification } = require('./commands/commands');
const { startServer } = require('./server');

const mongoose = require('mongoose');
const program = require('commander');

mongoose.connect([
    process.env.MONGODB_URI || 'mongodb://localhost:27017/forecast',
].join(''), { useNewUrlParser: true });



program
    .version('0.1.0')
    .option('--start-server', 'Start application')
    .option('--send-report', 'Send reports')
    .parse(process.argv);

if (program.startServer) startServer();
if (program.sendReport) reportNotification();
