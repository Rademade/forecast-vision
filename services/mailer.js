const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM = 'vision@demo-rademade.com';

const Mailgun = require('mailgun-js');

class Mailer {
  constructor (emailTo, template, subject) {
    this.emailTo = emailTo;
    this.template = template;
    this.subject = subject || 'Vision Report';
    this.MailGunInstance = new Mailgun({apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN});
  }

  sendEmail () {
    return new Promise((resolve, reject) => {
      this.MailGunInstance.messages().send({
        from: MAILGUN_FROM,
        to: this.emailTo,
        subject: this.subject,
        html: this.template
      }, function(err, body) {
        if (err) {
          reject(err)
        }

        resolve(body)
      })
    });
  }
}

module.exports.Mailer = Mailer;
