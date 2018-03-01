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

  getProjectPath() {
    return atom.workspace.project.getPaths()[0]
  },

  getCurrentPosition() {
    return {
      filePath: atom.workspace.getActiveTextEditor().getPath().replace(`${this.getProjectPath()}/`, ''),
      lineNumber: atom.workspace.getActiveTextEditor().getCursorScreenPosition().row + 1
    }
  },

  execute(code) {
    var osascript = require('osascript').eval

    let command = `
      tell application "iTerm2"
        tell current session of first window
          ${ atom.config.get('rspec-iterm.inBackground') ? '' : 'activate current session' }
          write text "${code}"
        end tell
      end tell
    `.toString()

    osascript(command, { type: 'AppleScript' }, function (err) {
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
