const { ClientInitialize } = require('./services/client-initialize.js')
const gql = require('graphql-tag');
const client = (new ClientInitialize()).client

var loginQuery = gql`
mutation Login_mutation {
    login(input: {
        clientMutationId:"0",
        email: "ks@rademade.com",
        password:"",
        rememberMe:true
    }) {
      clientMutationId
      viewer {
        id
        language
        firstName
        lastName
      }
      errors
    }
}`;

var viewerQuery = gql`
query Viewer_queries {
  viewer {
    id
    _component1jFanY: component(name: "login")
    actualPersonId
    lastName
  }
}
`;

var utilizationQuery = gql`
query Component_relay_renderer {
  viewer {
    id
    component: insightComponentsData(shareKey: "") {
      unitilization: utilizationList(dateCriteria: "25/03/2018_31/03/2018") {
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



client.mutate({
    variables: {},
    mutation: loginQuery,
}).then( (result) => {
    client.query({
        query: utilizationQuery
    }).then(function(data){
        console.log(data.data.viewer.component.unitilization.id)
    }).catch(error => {
        console.log(error)
    });
}).catch(error => {
    console.log(error)
});