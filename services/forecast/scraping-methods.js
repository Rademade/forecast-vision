const gql = require('graphql-tag');
const { ApolloClient } = require('apollo-client');

const { ForecastReportMember } = require('./report-member');

class ForecastScrapingMethods {

    /**
     * @param {ApolloClient} client
     */
    constructor(client) {
        this.client = client
    }

    getMembers() {
        return this.client.query({
            query: membersQuery
        }).catch(function(error){
            console.error(error)
        }).then(function (data) {
            return data.data.viewer.company.persons.edges.map(function(item){
                return new ForecastReportMember(item.node);
            }).filter(function(reportMember){
                return reportMember.isActive();
            });
        });
    }

    getScheduleAllocations() {
        return this.client.query({
            query: scheduleQuery
        }).catch(function(error){
            console.error(error)
        })
    }

}

let membersQuery = gql`
query Viewer_queries {
  viewer {    
    id
    company {
        id
        persons: allPersons(first: 1000, excludeClientUsers: true) {
            edges {
            node {
              id
              active
              firstName
              lastName
              monday
              tuesday
              wednesday
              thursday
              friday
              saturday
              sunday
              role {
                id
                name
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

exports.ForecastScrapingMethods = ForecastScrapingMethods;