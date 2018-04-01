const gql = require('graphql-tag');
const { ApolloClient } = require('apollo-client');

class DataScrapingMethods {

    /**
     * @param {ApolloClient} client
     */
    constructor(client) {
        this.client = client
    }
    getUtilization(startDate, endDate) {
        return this.client.query({
            query: utilizationQuery,
            variables: {
                dateRange: startDate.format('DD/MM/YYYY') + '_' + endDate.format('DD/MM/YYYY')
            }
        }).catch(function(error){
            console.error(error)
        });
    }
    getScheduleAllocations() {
        return this.client.query({
            query: scheduleQuery
        })
    }

}


let utilizationQuery = gql`
query Component_relay_renderer($dateRange: String) {
  viewer {
    id
    component: insightComponentsData(shareKey: "") {
      unitilization: utilizationList(dateCriteria: $dateRange) {
        id
        availableMinutesTotal
        scheduledMinutesTotal
        scheduledProjectTimeMinutes
        scheduledNonProjectTimeMinutes
        reportedTotal
        assignedTasksForecastTotal
        overTimeMinutesTotal
        utilizationListData {
          id
          name
          profilePictureId
          profilePictureDefaultId
          roleName
          availableMinutes
          scheduledMinutes
          scheduledNonProjectTimeMinutes
          scheduledProjectTimeMinutes
          reported
        }
      }
    }
  }
}`;

let scheduleQuery = gql`
query Viewer_queries {
  viewer {
    component: component(name: "scheduling")
    company @include(if: true) {
      allocations: allocations(first: 100000) {
        edges {
          node {
            id
            monday
            tuesday
            wednesday
            thursday
            friday
            saturday
            sunday
            startYear
            startMonth
            startDay
            endYear
            endMonth
            endDay
            description
            project {
              id
              name
              companyProjectId
              billable
            }
            person {
              id
              userType
              firstName
              lastName
              monday
              tuesday
              wednesday
              thursday
              friday
              saturday
              sunday
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
}`;

let projectsQuery = gql`
query Viewer_queries {
  viewer {
    id
    projects: projects(first: 100000) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}`;

exports.DataScrapingMethods = DataScrapingMethods;