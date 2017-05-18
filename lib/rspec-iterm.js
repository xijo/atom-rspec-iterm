'use babel';

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'rspec-iterm:run-all': () => this.runAll()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'rspec-iterm:run-by-line': () => this.runByLine()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  getCurrentPosition() {
    let projectPath = atom.workspace.project.getPaths()[0]
    return {
      filePath: atom.workspace.getActiveTextEditor().getPath().replace(`${this.projectPath}/`, ''),
      lineNumber: atom.workspace.getActiveTextEditor().getCursorScreenPosition().row + 1
    }
  },

  execute(code) {
    var osascript = require('node-osascript')

    let command = `
      tell application "iTerm2"
        tell current session of first window
          ${ atom.config.get('rspec-iterm.inBackground') ? '' : 'activate current session' }
          write text code
        end tell
      end tell
    `.toString()

    osascript.execute(command, { code: code }, function(err, result, raw) {
      if (err) return console.error(err)
    })
  },

  runByLine() {
    let position = this.getCurrentPosition()
    this.execute(`${atom.config.get('rspec-iterm.rspecCommand')} ${position.filePath}:${position.lineNumber}`)
  },

  runAll() {
    let position = this.getCurrentPosition()
    this.execute(`${atom.config.get('rspec-iterm.rspecCommand')} ${position.filePath}`)
  }
};
