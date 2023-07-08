import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { log } from './log';

interface AlwaysPinnedTabSettings {
  avoidDuplicateTabs: boolean;
}

const DEFAULT_SETTINGS: AlwaysPinnedTabSettings = {
  avoidDuplicateTabs: false,
};

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

class AlwaysPinnedTabSettingTab extends PluginSettingTab {
  plugin: AlwaysPinnedTab;

  constructor(app: App, plugin: AlwaysPinnedTab) {
    super(app, plugin);
    this.plugin = plugin;
  }

  save(): void {
    this.plugin.saveSettings();
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Always Pinned Tab' });

    new Setting(containerEl)
      .setName('Avoid duplicate tabs')
      .setDesc(
        'If the opened file already exists in tabs, the plugin will close the newly opened leaf and activate the pre-existing leaf.',
      )
      .addToggle((toggle) =>
        toggle.onChange((value) => {
          this.plugin.settings.avoidDuplicateTabs = value;
          this.save();
        }),
      );
  }
}
