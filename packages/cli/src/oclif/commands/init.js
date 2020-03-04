const { flags } = require('@oclif/command');

const BaseCommand = require('../ZapierBaseCommand');
const { buildFlags } = require('../buildFlags');
const appTemplates = require('../../app-templates');

const { isExistingEmptyDir } = require('../../utils/files');

const { initApp } = require('../../utils/init');
const {
  downloadExampleAppTo,
  removeReadme
} = require('../../utils/example-apps');

class InitCommand extends BaseCommand {
  generateCreateFunc(template) {
    return async tempAppDir => {
      this.startSpinner(
        `Downloading the ${template} starter integration from https://github.com/zapier/zapier-platform/tree/master/example-apps`
      );
      await downloadExampleAppTo(template, tempAppDir);
      await removeReadme(tempAppDir);
      this.stopSpinner();
    };
  }

  async perform() {
    const { path } = this.args;
    const { template } = this.flags;
    // sometimes the parser acts funny if there's an invalid flag and no arg, so just to double check,
    // see: https://github.com/oclif/parser/issues/57
    if (path.startsWith('-')) {
      this.error(`Invalid path: "${path}"`);
    }
    if (
      (await isExistingEmptyDir(path)) &&
      !(await this.confirm(`Path "${path}" is not empty. Continue anyway?`))
    ) {
      this.exit();
    }

    await initApp(path, this.generateCreateFunc(template));

    this.log();
    this.log(`A new integration has been created in directory "${path}"`);
  }
}

InitCommand.flags = buildFlags({
  commandFlags: {
    template: flags.string({
      char: 't',
      description: 'The template to start your integration with.',
      options: appTemplates,
      default: 'minimal'
    })
  }
});
InitCommand.args = [
  {
    name: 'path',
    required: true,
    description:
      "Where to create the new integration. If the directory doesn't exist, it will be created. If the directory isn't empty, we'll ask for confirmation"
  }
];
InitCommand.examples = [
  'zapier init ./some/path',
  'zapier init . --template typescript'
];
InitCommand.description = `Initialize a new Zapier integration. Optionally uses a template.

After running this, you'll have a new example integration in your directory. If you re-run this command on an existing directory it will leave existing files alone and not clobber them.

This doesn't register or deploy the integration with Zapier - try the \`zapier register\` and \`zapier push\` commands for that!`;

InitCommand.skipValidInstallCheck = true;

module.exports = InitCommand;
