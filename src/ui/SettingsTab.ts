import { App, PluginSettingTab, Setting } from "obsidian";
import { getStrings } from "../utils/strings";
import type KnowledgeHeatMapPlugin from "../main";

export class SettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: KnowledgeHeatMapPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const t = getStrings();

    containerEl.createEl("h2", { text: t.settingsTitle });

    containerEl.createEl("h3", { text: t.settingsGeneralHeader });

    new Setting(containerEl)
      .setName(t.settingsEnableStartupName)
      .setDesc(t.settingsEnableStartupDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableOnStartup)
          .onChange(async (value) => {
            this.plugin.settings.enableOnStartup = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t.settingsRefreshName)
      .setDesc(t.settingsRefreshDesc)
      .addText((text) =>
        text
          .setPlaceholder("0")
          .setValue(String(this.plugin.settings.refreshInterval))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            this.plugin.settings.refreshInterval = isNaN(num) ? 0 : num;
            await this.plugin.saveSettings();
            this.plugin.setupRefreshInterval();
          })
      );

    new Setting(containerEl)
      .setName(t.settingsNotificationsName)
      .setDesc(t.settingsNotificationsDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showNotifications)
          .onChange(async (value) => {
            this.plugin.settings.showNotifications = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: t.settingsVisualsHeader });

    new Setting(containerEl)
      .setName(t.settingsPaletteName)
      .setDesc(t.settingsPaletteDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("amber", t.paletteAmberName)
          .addOption("ocean", "Ocean")
          .addOption("forest", "Forest")
          .addOption("sunset", "Sunset")
          .addOption("monochrome", "Monochrome")
          .addOption("neon", "Neon")
          .addOption("custom", t.paletteCustomName)
          .setValue(this.plugin.settings.palette)
          .onChange(async (value) => {
            this.plugin.settings.palette = value as typeof this.plugin.settings.palette;
            await this.plugin.saveSettings();
            this.onSettingsChanged();
            this.display(); 
          })
      );

    new Setting(containerEl)
      .setName(t.settingsDefaultTimeRangeName)
      .setDesc(t.settingsDefaultTimeRangeDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("all", t.timeRangeAll)
          .addOption("90d", t.timeRange90d)
          .addOption("30d", t.timeRange30d)
          .addOption("7d", t.timeRange7d)
          .setValue(this.plugin.settings.timeRange)
          .onChange(async (value) => {
            this.plugin.settings.timeRange = value;
            await this.plugin.saveSettings();
            this.onSettingsChanged();
          })
      );

    if (this.plugin.settings.palette === "custom") {
      new Setting(containerEl)
        .setName(t.colorFrozenName)
        .addText((text) =>
          text
            .setValue(this.plugin.settings.customColors.frozen)
            .onChange(async (value) => {
              this.plugin.settings.customColors.frozen = value;
              await this.plugin.saveSettings();
              this.onSettingsChanged();
            })
        );

      new Setting(containerEl)
        .setName(t.colorColdName)
        .addText((text) =>
          text
            .setValue(this.plugin.settings.customColors.cold)
            .onChange(async (value) => {
              this.plugin.settings.customColors.cold = value;
              await this.plugin.saveSettings();
              this.onSettingsChanged();
            })
        );

      new Setting(containerEl)
        .setName(t.colorWarmName)
        .addText((text) =>
          text
            .setValue(this.plugin.settings.customColors.warm)
            .onChange(async (value) => {
              this.plugin.settings.customColors.warm = value;
              await this.plugin.saveSettings();
              this.onSettingsChanged();
            })
        );

      new Setting(containerEl)
        .setName(t.colorHotName)
        .addText((text) =>
          text
            .setValue(this.plugin.settings.customColors.hot)
            .onChange(async (value) => {
              this.plugin.settings.customColors.hot = value;
              await this.plugin.saveSettings();
              this.onSettingsChanged();
            })
        );

      new Setting(containerEl)
        .setName(t.colorBurningName)
        .addText((text) =>
          text
            .setValue(this.plugin.settings.customColors.burning)
            .onChange(async (value) => {
              this.plugin.settings.customColors.burning = value;
              await this.plugin.saveSettings();
              this.onSettingsChanged();
            })
        );
    }

    containerEl.createEl("h3", { text: t.settingsAdvancedHeader });

    new Setting(containerEl)
      .setName(t.settingsCacheName)
      .setDesc(t.settingsCacheDesc)
      .addText((text) =>
        text
          .setPlaceholder("30")
          .setValue(String(this.plugin.settings.cacheTimeoutMinutes))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            this.plugin.settings.cacheTimeoutMinutes = isNaN(num) ? 30 : num;
            await this.plugin.saveSettings();
            this.plugin.cache.setTTL(this.plugin.settings.cacheTimeoutMinutes);
          })
      );

    new Setting(containerEl)
      .setName(t.settingsExcludeFoldersName)
      .setDesc(t.settingsExcludeFoldersDesc)
      .addTextArea((text) =>
        text
          .setPlaceholder("Archive\nTemplates")
          .setValue(this.plugin.settings.excludeFolders.join("\n"))
          .onChange(async (value) => {
            this.plugin.settings.excludeFolders = value
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.length > 0);
            await this.plugin.saveSettings();
            this.plugin.cache.invalidateAll();
            this.onSettingsChanged();
          })
      );

    new Setting(containerEl)
      .setName(t.settingsExcludeTagsName)
      .setDesc(t.settingsExcludeTagsDesc)
      .addTextArea((text) =>
        text
          .setPlaceholder("#private\n#temp")
          .setValue(this.plugin.settings.excludeTags.join("\n"))
          .onChange(async (value) => {
            this.plugin.settings.excludeTags = value
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.length > 0);
            await this.plugin.saveSettings();
            this.plugin.cache.invalidateAll();
            this.onSettingsChanged();
          })
      );

    new Setting(containerEl)
      .setName(t.settingsMinNoteAgeDaysName)
      .setDesc(t.settingsMinNoteAgeDaysDesc)
      .addText((text) =>
        text
          .setPlaceholder("0")
          .setValue(String(this.plugin.settings.minNoteAgeDays))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            this.plugin.settings.minNoteAgeDays = isNaN(num) ? 0 : num;
            await this.plugin.saveSettings();
            this.onSettingsChanged();
          })
      );

    new Setting(containerEl)
      .setName(t.settingsDebugName)
      .setDesc(t.settingsDebugDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.debugMode)
          .onChange(async (value) => {
            this.plugin.settings.debugMode = value;
            await this.plugin.saveSettings();
          })
      );
  }

  private onSettingsChanged(): void {
    if (this.plugin.settings.enabled) {
      this.plugin.debouncedApply();
    }
    this.plugin.refreshD3View();
  }
}
