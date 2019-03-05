const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || 'key-5174fa2d2e241d0e3f18163789c3b680';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.demo-rademade.com';
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
