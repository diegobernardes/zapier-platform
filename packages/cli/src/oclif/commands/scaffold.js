const path = require('path');

const { flags } = require('@oclif/command');

const BaseCommand = require('../ZapierBaseCommand');
const { buildFlags } = require('../buildFlags');

const {
  plural,
  updateEntryFile,
  writeTemplateFile,
  createTemplateContext
} = require('../../utils/scaffold');

const getNewFileDirectory = (action, test = false) =>
  `${test ? 'test/' : ''}${plural(action)}`;

const getLocalFilePath = (directory, noun) => `${directory}/${noun}`;
/**
 * both the string to `require` and later, the filepath to write to
 */
const getFullActionFilePath = (directory, noun) =>
  path.join(process.cwd(), getLocalFilePath(directory, noun));

const getFullActionFilePathWithExtension = (directory, noun) =>
  `${getFullActionFilePath(directory, noun)}.js`;

class ScaffoldCommand extends BaseCommand {
  async perform() {
    const { actionType, noun } = this.args;

    // able to be used for filepaths and stuff

    // TODO: interactive portion here?
    const {
      dest: newActionDir = getNewFileDirectory(actionType),
      testDest: newTestActionDir = getNewFileDirectory(actionType, true),
      entry = 'index.js',
      force
    } = this.flags;

    const shouldIncludeComments = !this.flags['no-help']; // when called from other commands (namely `init`) this will be false
    const templateContext = createTemplateContext(
      actionType,
      noun,
      shouldIncludeComments
    );

    const safeNoun = templateContext.KEY;

    // * create 2 new files - the scaffold and the test
    this.log(`Adding a new ${actionType} to your project.\n`);
    const preventOverwrite = !force;
    // TODO: read from config file?

    this.startSpinner(
      `Creating new file: ${getLocalFilePath(newActionDir, safeNoun)}.js`
    );
    await writeTemplateFile(
      actionType,
      templateContext,
      getFullActionFilePathWithExtension(newActionDir, safeNoun),
      preventOverwrite
    );
    this.stopSpinner();

    this.startSpinner(
      `Creating new test file: ${getLocalFilePath(
        newTestActionDir,
        safeNoun
      )}.js`
    );
    await writeTemplateFile(
      'test',
      templateContext,
      getFullActionFilePathWithExtension(newTestActionDir, safeNoun),
      preventOverwrite
    );
    this.stopSpinner();

    // * rewire the index.js to point ot the new file
    this.startSpinner(`Rewriting your ${entry}`);

    const entryFilePath = path.join(process.cwd(), entry);
    await updateEntryFile(
      entryFilePath,
      templateContext.VARIABLE,
      getFullActionFilePath(newActionDir, safeNoun),
      actionType,
      templateContext.KEY
    );

    this.stopSpinner();

    this.log(`\nFinished! Your new ${actionType} is ready to use.`);
  }
}

ScaffoldCommand.args = [
  {
    name: 'actionType',
    help: 'What type of step type are you creating?',
    required: true,
    options: ['trigger', 'search', 'create', 'resource']
  },
  {
    name: 'noun',
    help:
      'What sort of object this action acts on. For example,  of the new thing to create',
    required: true
  }
];

ScaffoldCommand.flags = buildFlags({
  commandFlags: {
    dest: flags.string({
      char: 'd',
      description:
        "Specify the new file's directory. Use this flag when you want to create a different folder structure such as `src/triggers` instead of the default `triggers`. Defaults to `[triggers|searches|creates]/{noun}`."
    }),
    'test-dest': flags.string({
      description:
        "Specify the new test file's directory. Use this flag when you want to create a different folder structure such as `src/triggers` instead of the default `triggers`. Defaults to `test/[triggers|searches|creates]/{noun}`."
    }),
    entry: flags.string({
      char: 'e',
      description:
        "Supply the path to your integration's root (`index.js`). Only needed if  your `index.js` is in a subfolder, like `src`.",
      default: 'index.js'
    }),
    force: flags.boolean({
      char: 'f',
      description:
        'Should we overwrite an exisiting trigger/search/create file?',
      default: false
    }),
    'no-help': flags.boolean({
      description:
        "When scaffolding, should we skip adding helpful intro comments? Useful if this isn't your first rodeo.",
      default: false
    })
    // TODO: typescript? jscodeshift supports it. We could tweak a template for it
  }
});

ScaffoldCommand.examples = [
  'zapier scaffold trigger contact',
  'zapier scaffold search contact --dest=my_src/searches',
  'zapier scaffold create contact --entry=src/index.js',
  'zapier scaffold resource contact --force'
];

ScaffoldCommand.description = `Add a starting trigger, create, search, or resource to your integration.

The first argument should be one of \`trigger|search|create|resource\` followed by the noun that this will act on (something like "contact" or "deal").

The scaffold command does two general things:

* Creates a new file (such as \`triggers/contact.js\`)
* Imports and registers it inside your \`index.js\`

You can mix and match several options to customize the created scaffold for your project.`;

module.exports = ScaffoldCommand;
