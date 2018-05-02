const gql = require('graphql-tag');
const { ForecastGrabberInitialize } = require('./initialize');
const { ForecastGrabberScrapingMethods } = require('./scraping-methods');

const FORECAST_LOGIN = process.env.FORECAST_LOGIN || '';
const FORECAST_PASSWORD = process.env.FORECAST_PASSWORD || '';

class ForecastGrabberScrapingAuth {
    constructor() {
        this.client = (new ForecastGrabberInitialize()).client;
        this.scrapingMethods = new ForecastGrabberScrapingMethods(this.client);
    }
    auth() {
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

exports.ForecastGrabberScrapingAuth = ForecastGrabberScrapingAuth;