const gql = require('graphql-tag');
const { ForecastInitialize } = require('./initialize');
const { ForecastScrapingMethods } = require('./scraping-methods');

const FORECAST_LOGIN = process.env.FORECAST_LOGIN || '';
const FORECAST_PASSWORD = process.env.FORECAST_PASSWORD || '';

class ForecastScrapingAuth {
    constructor() {
        this.client = (new ForecastInitialize()).client;
        this.scrapingMethods = new ForecastScrapingMethods(this.client);
    }
    auth() {
        let loginQuery = gql`mutation Login_mutation($input: LoginInput!) {
            login(input: $input) {
              clientMutationId
              viewer {
                csrfToken
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
        this.auth().then((data) => {
            console.log('Scrapper methods loaded');
            callback(this.scrapingMethods, data.data.login.viewer.csrfToken);
        });
    }

}

exports.ForecastScrapingAuth = ForecastScrapingAuth;
