const axios = require('axios');
const moment = require('moment')
const { LeaveDay } = require('../../models/leave-days');

const APIKey = process.env.PEOPLEHR_API_KEY;

class PeopleHRMember {
  constructor(startDate, endDdate, memberDocument) {
    this.startDate = startDate;
    this.endDdate = endDdate;
    this.memberDocument = memberDocument
    this.holidayData = null
    this.abscenceData = null
  }

  async fetchAbsenceData () {
    try {
      let abscenceData = await axios.post('https://api.peoplehr.net/Absence', {
        APIKey: APIKey,
        Action: 'GetAbsenceDetail',
        EmployeeId: this.memberDocument.peopleHRId,
        StartDate: moment(this.startDate).format('YYYY-MM-DD'),
        EndDate: moment(this.endDdate).format('YYYY-MM-DD')
      })

      this.abscenceData = abscenceData.data.Result
    } catch (error) {
      console.log(error)
    }
  }


  async fetchHolidayData () {
    try {
      let holidayData = await axios.post('https://api.peoplehr.net/Holiday', {
        APIKey: APIKey,
        Action: 'GetHolidayDetail',
        EmployeeId: this.memberDocument.peopleHRId,
        StartDate: moment(this.startDate).format('YYYY-MM-DD'),
        EndDate: moment(this.endDdate).format('YYYY-MM-DD')
      })

      this.holidayData = holidayData.data.Result
    } catch (error) {
      console.log(error)
    }
  }

  getHolidaysDays () {
    return this.holidayData
  }

  getAbsenceDays () {
    return this.abscenceData
  }



  async updateLeaveDay (leaveDay, projectID) {
    try {
      let leaveDayObject = new LeaveDay({
        item: leaveDay,
        forecastMemberId: this.memberDocument.forecastId,
        forecastProjectId: projectID
      });

      let exists = await LeaveDay.find({'item.AbsenceLeaveTxnId': leaveDayObject.item.AbsenceLeaveTxnId});

      if (exists.length < 1) {
        leaveDayObject.set('isNewAllocation', true)

        return await leaveDayObject.save()
      }
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports.PeopleHRMember = PeopleHRMember
