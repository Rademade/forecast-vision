const gql = require('graphql-tag');
const { ClientInitialize } = require('./client-initialize')
const { DataScrapingMethods } = require('./data-scraping-methods')

const FORECAST_LOGIN = process.env.FORECAST_LOGIN || '';
const FORECAST_PASSWORD = process.env.FORECAST_PASSWORD || '';

class DataScraping {
    constructor() {
        this.client = (new ClientInitialize()).client;
        this.scrapingMethods = new DataScrapingMethods(this.client);
    }
    auth() {
        // TODO extract ENV variable
        let loginQuery = gql`mutation Login_mutation($input: LoginInput!) {
            login(input: $input) {
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
            variables: {
                input: {
                    email: FORECAST_LOGIN,
                    password: FORECAST_PASSWORD
                }
            },
            mutation: loginQuery,
        }).catch((error) => {
            console.log('Login error');
            console.error(error);
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