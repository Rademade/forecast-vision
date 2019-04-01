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
                // console.log(item)
                return new ForecastReportMember(item.node);
            }).filter(function(reportMember){
                return reportMember.isActive();
            });
        });
    }

    /**
     * @description Use Symbol for private methods
     * @param allocation
     * @param shouldUpdate
     * @returns allocationData
     */

     _dataAllocationsBuilder (allocation, shouldUpdate) {
        let output = {
            csrfToken: allocation.csrfToken,
            endDay: allocation.endDay,
            endMonth: allocation.endMonth,
            endYear: allocation.endYear,
            friday: allocation.friday,
            idleTimeId: null,
            monday: allocation.monday,
            personId: allocation.personId,
            projectGroupId: null,
            projectId: allocation.projectId,
            saturday: allocation.saturday,
            startDay: allocation.startDay,
            startMonth: allocation.startMonth,
            startYear: allocation.startYear,
            sunday: allocation.sunday,
            tuesday: allocation.tuesday,
            wednesday: allocation.wednesday,
            thursday: allocation.thursday,
        };

        if (shouldUpdate) {
            output.id = allocation.id
        }

        return output
    }

    createAllocation (allocation) {
        return new Promise((resolve, reject) => {
            let variables = {
                input: this._dataAllocationsBuilder(allocation)
            };

            return this.client.mutate({
                variables: variables,
                mutation: createQuery,
            }).catch((error) =>{
                console.error(error);
                reject(error)
            }).then(data => {
                resolve(data);
                return data
            })
        })
    }

    updateAllocation (allocation) {
        return new Promise((resolve, reject) => {
            let variables = {
                input: this._dataAllocationsBuilder(allocation, true)
            };

            return this.client.mutate({
                variables: variables,
                mutation: updateQuery,
            }).catch((error) =>{
                console.error(error);
                reject(error)
            }).then(data => {
                resolve(data);
                return data
            })
        })
    }

    getScheduleAllocations() {
        return this.client.query({
            query: scheduleQuery
        }).catch(function(error){
            console.error(error)
        })
    }

    deleteAllocation (variables) {
        return new Promise((resolve, reject) => {
            let output = {
                input: variables
            };

            return this.client.mutate({
                mutation: deleteQuery,
                variables: output
            }).catch((error) =>{
                console.error(error)
                reject(error)
            }).then(data => {
                resolve(data);
                return data
            })
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
              role {
                id
                name
              }
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

let createQuery = gql`
mutation CreateAllocation($input: CreateAllocationInput!) {
	createAllocation(input: $input) {
   	 	allocation {
   	 		node {
	   	 		id
	   	 		monday
	   	 		tuesday
	   	 		wednesday
	   	 		thursday
	   	 		friday
	   	 		saturday
	   	 		sunday
	   	 		projectGroupId
	   	 		projectGroupColor
	   	 		description
	   	 		startYear
	   	 		startMonth
	   	 		startDay
	   	 		endYear
	   	 		endMonth
	   	 		endDay
	   	 		project {
	   	 			id
	   	 			projectPersons (first: 10000) {
	   	 				edges {
	   	 					node {
	   	 						person {
	   	 							id
	   	 						}
	   	 					}
	   	 				}
	   	 			}
	   	 		}
	   	 		idleTime {
	   	 			id
	   	 			name
	   	 		}
	   	 		person {
	   	 			id
	   	 			role {
	   	 				id
	   	 			}
	   	 		}
	   	 	}
   	 	}
	}
}
`;

let updateQuery = gql`
mutation UpdateAllocation($input: UpdateAllocationInput!) {
				updateAllocation(input: $input) {
   	 				allocation {
   	 					id
   	 					monday
   	 					tuesday
   	 					wednesday
   	 					thursday
   	 					friday
   	 					saturday
   	 					sunday
   	 					projectGroupId
   	 					description
   	 					startYear
   	 					startMonth
   	 					startDay
   	 					endYear
   	 					endMonth
   	 					endDay
   	 					project {
   	 						id
   	 						projectPersons (first: 10000) {
   	 							edges {
   	 								node {
   	 									person {
   	 										id
   	 									}
   	 								}
   	 							}
   	 						}
   	 					}
   	 					idleTime {
   	 						id
   	 						name
   	 					}
   	 					person {
   	 						id
   	 						role {
   	 							id
   	 						}
   	 					}
   	 				}
				}
			}
`;

let deleteQuery = gql`
mutation DeleteAllocation($input: DeleteAllocationInput!) {
				deleteAllocation(input: $input) {
   	 				deletedAllocationId
				}
			}
`;


exports.ForecastScrapingMethods = ForecastScrapingMethods;
