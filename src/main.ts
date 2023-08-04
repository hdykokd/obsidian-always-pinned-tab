import { Plugin, WorkspaceLeaf } from 'obsidian';
import { log } from './message';
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

      // @ts-expect-error
      if (!leaf.pinned) {
        leaf.setPinned(true);
      }

      if (this.settings.avoidDuplicateTabs) {
        const sameLeaves: WorkspaceLeaf[] = [];

        // @ts-expect-error
        leaf.parent?.children?.forEach((child: WorkspaceLeaf & { id: string }) => {
          const l = this.app.workspace.getLeafById(child.id);
          const isMarkdown = 'file' in leaf.view && 'file' in l.view;
          // @ts-expect-error
          if (isMarkdown && leaf.view.file?.path === l.view.file?.path) {
            sameLeaves.push(l);
          }
        });
        if (sameLeaves.length === 0) return;
        const [main, ...duplicates] = sameLeaves;
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
      }
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
