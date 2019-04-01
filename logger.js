const winston = require('winston');
require('winston-mongodb');

const transport = new winston.transports.MongoDB({
  db : process.env.MONGODB_URI || 'mongodb://localhost:27017/forecast',
  collection: 'membersWithoutPeopleHRId',
  level: 'info'
});

const peopleHRLogger = winston.createLogger({
  transports: [transport]
});

module.exports.peopleHRLogger = peopleHRLogger
