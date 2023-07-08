import { Plugin } from 'obsidian';
import { log } from './log';
import { AlwaysPinnedTabSettings, AlwaysPinnedTabSettingTab, DEFAULT_SETTINGS } from './setting';

export default class AlwaysPinnedTab extends Plugin {
  settings: AlwaysPinnedTabSettings;

  async onload() {
    log('loading...');
    await this.loadSettings();
    this.registerEvents();

    this.addSettingTab(new AlwaysPinnedTabSettingTab(this.app, this));
    log('loaded.');
  }

  async onunload() {
    log('unloaded.');
  }

  async registerEvents() {
    this.app.workspace.on('active-leaf-change', (leaf) => {
      if (!leaf) return;
      const state = leaf.getViewState();
      if (state.type !== 'markdown') return;

      if (!this.settings.avoidDuplicateTabs) {
        // @ts-expect-error
        if (!leaf.pinned) {
          leaf.setPinned(true);
        }
        return;
      }

      const file = this.app.workspace.getActiveFile();
      const activeViews = this.app.workspace.getLeavesOfType('markdown');
      const sameViews = activeViews.filter((l) => {
        const s = l.view.getState();
        if (s.file === file?.path) {
          return true;
        }
        return false;
      });

      const [main, ...duplicates] = sameViews;
      // @ts-expect-error
      if (!main.pinned) {
        main.setPinned(true);
      }
      this.app.workspace.setActiveLeaf(main);

      duplicates.forEach((l) => {
        sleep(0).then(() => {
          l.detach();
        });
      });
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
