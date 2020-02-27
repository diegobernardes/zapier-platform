// triggers on a new <%= LOWER_NOUN %> with a certain tag
const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://jsonplaceholder.typicode.com/posts',
    params: {
      tag: bundle.inputData.tagName
    }
  });
  response.throwForStatus();
  return z.JSON.parse(response.content);
};

module.exports = {
  key: '<%= KEY %>',
  noun: '<%= NOUN %>',

  display: {
    label: 'Get <%= NOUN %>',
    description: 'Triggers when a new <%= LOWER_NOUN %> is created.'
  },

  operation: {
    perform,

    <%= INCLUDE_INTRO_COMMENTS ? [
      '// `inputFields` defines the fields a user could provide',
      '// Zapier will pass them in as `bundle.inputData` later. They\'re optional.'
    ].join('\n    ') : '' %>
    inputFields: [],

    <%= INCLUDE_INTRO_COMMENTS ? [
      '// In cases where Zapier needs to show an example record to the user, but we are unable to get a live example',
      '// from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of',
      '// returned records, and have obviously dummy values that we can show to any user.'
    ].join('\n    ') : '' %>
    sample: {
      id: 1,
      name: 'Test'
    },

    <%= INCLUDE_INTRO_COMMENTS ? [
      '// If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels',
      '// For a more complete example of using dynamic fields see',
      '// https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields',
      '// Alternatively, a static field definition can be provided, to specify labels for the fields'
    ].join('\n    ') : '' %>
    outputFields: [
      // placeholders to match the jsonplaceholder call
      // {key: 'id', label: 'Person ID'},
      // {key: 'name', label: 'Person Name'}
    ]
  }
};
