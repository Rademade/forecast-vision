const fetch = require('node-fetch');

const { createHttpLink } = require('apollo-link-http');
const { ApolloClient } = require('apollo-client');
const { ApolloLink } = require('apollo-link');
const { InMemoryCache } = require('apollo-cache-inmemory');

class ClientInitialize {

    constructor() {
        this.cookies = [];
        this.client = new ApolloClient({
            link: this.getCookieLink().concat(this.setCookieLink()).concat(this.getHttpLink()),
            cache: new InMemoryCache()
        })
    }
    getHttpLink() {
        return createHttpLink({
            uri: 'https://graphql.forecast.it/graphql',
            credentials: 'same-origin',
            fetch: fetch
        })
    }
    setCookieLink() {
        return new ApolloLink((operation, forward) => {
            // console.log(this.cookies)
            operation.setContext({
                headers: {
                    cookie: this.cookies.join('')
                }
            });
            return forward(operation);
        })
    }
    getCookieLink() {
        return new ApolloLink((operation, forward) => {
            return forward(operation).map(response => {
                let context = operation.getContext();
                let { response: { headers } } = context;
                if (headers && headers.get('set-cookie')) {
                    this.cookies.push(headers.get('set-cookie'))
                }
                return response;
            });
        })
    }
}

exports.ClientInitialize = ClientInitialize;