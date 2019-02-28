const { ReportLoaderFactory } = require('../services/report-loader-factory');
const { MembersCircle } = require('./report/collection/members-circle');
const { TogglScrapingMethods } = require('./toggl/scraping-methods');
const moment = require('moment');
const _ = require('lodash');

class MemberReport {
  constructor () {
    this.togglLoader = new TogglScrapingMethods();

    this.membersList = []
  }

  async getMembersWeeklyReport (startDate, endDate) {
    return new Promise((resolve, reject) => {
      try {
        ReportLoaderFactory.getMonthReport(startDate, endDate).load((intervalReport) => {
          _.forEach(intervalReport[0].membersList.items, (value, key) => {
            this.membersList.push(value)
          });

          resolve(this.membersList);
        })
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  }

  getBillablePercentPlan (member) {
    let memberCircleElement = new MembersCircle();

    memberCircleElement.addMember(member);

    return memberCircleElement.getLoadPercent()
  }

  getBillablePercentFact (member) {
    let memberCircleElement = new MembersCircle();

    memberCircleElement.addMember(member);

    return memberCircleElement.getFactLoadPercent()
  }

  async isTaskWithoutProject (member) {
    const startDate =  moment().subtract(1, 'week').startOf('week');
    const endDate =  moment();

    try {
      let userReport = await this.togglLoader.getUserToggleReport(startDate, endDate, {
        userId: member.memberDocument.togglId,
        billable: 'both'
      });

      let isNoProject = userReport.items.some(report => report.title.project === null);

      return isNoProject
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports.MemberReport = MemberReport;
