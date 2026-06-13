import { App, PluginSettingTab, Setting } from "obsidian";
import { getStrings } from "../utils/strings";

export class SettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: any) {
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
          .addOption("amber", t.legendCold === "❄️ Soğuk" ? "Amber Isı Spektrumu" : "Amber Heat Spectrum")
          .addOption("custom", t.legendCold === "❄️ Soğuk" ? "Özel Renkler" : "Custom Colors")
          .setValue(this.plugin.settings.palette)
          .onChange(async (value) => {
            this.plugin.settings.palette = value as "amber" | "custom";
            await this.plugin.saveSettings();
            this.onSettingsChanged();
            this.display(); 
          })
      );

    if (this.plugin.settings.palette === "custom") {
      new Setting(containerEl)
        .setName(t.legendCold === "❄️ Soğuk" ? "Frozen (En Soğuk) Rengi" : "Frozen (Coldest) Color")
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
        .setName(t.legendCold === "❄️ Soğuk" ? "Cold Rengi" : "Cold Color")
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
        .setName(t.legendCold === "❄️ Soğuk" ? "Warm Rengi" : "Warm Color")
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
        .setName(t.legendCold === "❄️ Soğuk" ? "Hot Rengi" : "Hot Color")
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
        .setName(t.legendCold === "❄️ Soğuk" ? "Burning (En Sıcak) Rengi" : "Burning (Hottest) Color")
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
