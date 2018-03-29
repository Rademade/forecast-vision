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
    getProjects() {
        return this.client.query({
            query: projectsQuery
        })
    }
    getUsers() {
        return this.client.query({
            query: ''
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