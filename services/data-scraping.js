const gql = require('graphql-tag');
const { ClientInitialize } = require('./client-initialize')
const { DataScrapingMethods } = require('./data-scraping-methods')

class DataScraping {
    constructor() {
        this.client = (new ClientInitialize()).client;
        this.scrapingMethods = new DataScrapingMethods(this.client);
    }
    auth() {
        // TODO extract ENV variable
        let loginQuery = gql`mutation Login_mutation {
            login(input: {
                clientMutationId:"0",
                email: "ks@rademade.com",
                password:"rademade",
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
        return this.client.mutate({
            variables: {},
            mutation: loginQuery,
        })
    }
    ready(callback) {
        this.auth().then(() => {
            console.log('Scrapper methods loaded');
            callback(this.scrapingMethods);
        });
    }

}

exports.DataScraping = DataScraping;