import { PluginSettingTab, App, Setting } from 'obsidian';
import AlwaysPinnedTab from './main';

export interface AlwaysPinnedTabSettings {
  avoidDuplicateTabs: boolean;
}

export const DEFAULT_SETTINGS: AlwaysPinnedTabSettings = {
  avoidDuplicateTabs: false,
};

const createToggle = (
  containerEl: HTMLElement,
  plugin: AlwaysPinnedTab,
  key: keyof AlwaysPinnedTabSettings,
  name: string,
  desc: string,
) => {
  return new Setting(containerEl)
    .setName(name)
    .setDesc(desc)
    .addToggle((toggle) =>
      toggle.setValue(plugin.settings[key]).onChange((value) => {
        plugin.settings[key] = value;
        plugin.saveSettings();
      }),
    );
};

export class AlwaysPinnedTabSettingTab extends PluginSettingTab {
  plugin: AlwaysPinnedTab;

  constructor(app: App, plugin: AlwaysPinnedTab) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Always Pinned Tab' });

    createToggle(
      containerEl,
      this.plugin,
      'avoidDuplicateTabs',
      'Avoid duplicate tabs',
      'If the opened file already exists in tabs, the plugin will close the newly opened leaf and activate the pre-existing leaf.',
    );
  }
}
