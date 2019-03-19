const FORECAST_API_KEY = process.env.FORECAST_API_KEY || 'c4975f31-ef88-4281-ab3a-8703fa936892';
const axios = require('axios');

export class CreateAllocationItem {
  constructor(startDate, endDate, project, person) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.project = project;
    this.person = person
  }

  async createAllocationItem () {
    let createdItem = await axios({
      url: 'https://api.forecast.it/api/v1/allocations',
      method: 'post',
      headers: {
        "X-FORECAST-API-KEY": FORECAST_API_KEY
      },
      data: {
        start_date: this.startDate,
        end_date: this.endDate,
        person: this.person,
        project: this.project
      }
    })
  }
}
