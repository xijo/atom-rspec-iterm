'use babel';

import { CompositeDisposable } from 'atom';

export default {
  editor: null,
  subscriptions: null,

  activate(state) {
    this.editor = atom.workspace.getActiveTextEditor()
    this.projectPath = atom.workspace.project.getPaths()[0]
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'rspec-iterm:run-all': () => this.runAll()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'rspec-iterm:run-by-line': () => this.runByLine()
    }));
  },

  activeFilePath() {
    return this.editor.getPath().replace(`${this.projectPath}/`, '')
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  execute(code) {
    var osascript = require('node-osascript')

    let command = `
      tell application "iTerm2"
        tell current session of first window
          ${ atom.config.get('rspec-iterm.inBackground') ? 'activate current session' : '' }
          write text code
        end tell
      end tell
    `

    osascript.execute(command, { code: code }, function(err, result, raw) {
      if (err) return console.error(err)
    })
  },

  runByLine() {
    let filePath = this.activeFilePath()
    let lineNumber = this.editor.getCursorScreenPosition().row
    this.execute(`bundle exec rspec ${filePath}:${lineNumber}`)
  },

  runAll() {
    let filePath = this.activeFilePath()
    this.execute(`bundle exec rspec ${filePath}`)
  }
};
