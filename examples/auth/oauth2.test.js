/* globals describe, it, before */
require('should');

const zapier = require('zapier-platform-core');

zapier.tools.env.inject(); // read fromt the .env file

const App = require('../index');
const appTester = zapier.createAppTester(App);

// Only here so the tests out of the box.
// You should create a `.env` file and populate it with the necessarily configuration
// it should look like:
/*
    CLIENT_ID=1234
    CLIENT_SECRET=asdf
*/
// then you can delete the following 2 lines
process.env.CLIENT_ID = process.env.CLIENT_ID || '1234';
process.env.CLIENT_SECRET = process.env.CLIENT_SECRET || 'asdf';

describe('oauth2 app', () => {
  before(() => {
    // It's a good idea to store your Client ID and Secret in the environment rather than in code.
    if (!(process.env.CLIENT_ID && process.env.CLIENT_SECRET)) {
      throw new Error(
        `Before running the tests, make sure CLIENT_ID and CLIENT_SECRET are available in the environment.`
      );
    }
  });

  it('generates an authorize URL', async () => {
    const bundle = {
      // In production, these will be generated by Zapier and set automatically
      inputData: {
        state: '4444',
        redirect_uri: 'https://zapier.com/'
      },
      environment: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET
      }
    };

    const authorizeUrl = await appTester(
      App.authentication.oauth2Config.authorizeUrl,
      bundle
    );

    authorizeUrl.should.eql(
      'https://auth-json-server.zapier-staging.com/oauth/authorize?client_id=1234&state=4444&redirect_uri=http%3A%2F%2Fzapier.com%2F&response_type=code'
    );
  });

  it('can fetch an access token', async () => {
    const bundle = {
      inputData: {
        // In production, Zapier passes along whatever code your API set in the query params when it redirects
        // the user's browser to the `redirect_uri`
        code: 'one_time_code'
      },
      environment: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET
      },
      cleanedRequest: {
        querystring: {
          accountDomain: 'test-account',
          code: 'one_time_code'
        }
      },
      rawRequest: {
        querystring: '?accountDomain=test-account&code=one_time_code'
      }
    };

    const result = await appTester(
      App.authentication.oauth2Config.getAccessToken,
      bundle
    );

    result.access_token.should.eql('a_token');
    result.refresh_token.should.eql('a_refresh_token');
  });

  it('can refresh the access token', async () => {
    const bundle = {
      // In production, Zapier provides these. For testing, we have hard-coded them.
      // When writing tests for your own app, you should consider exporting them and doing process.env.MY_ACCESS_TOKEN
      authData: {
        access_token: 'a_token',
        refresh_token: 'a_refresh_token'
      },
      environment: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET
      }
    };

    const result = await appTester(
      App.authentication.oauth2Config.refreshAccessToken,
      bundle
    );
    result.access_token.should.eql('a_new_token');
  });

  it('includes the access token in future requests', async () => {
    const bundle = {
      authData: {
        access_token: 'a_token',
        refresh_token: 'a_refresh_token'
      }
    };

    const response = await appTester(App.authentication.test, bundle);
    response.json.should.have.property('username');
    response.json.username.should.eql('Bret');
  });
});