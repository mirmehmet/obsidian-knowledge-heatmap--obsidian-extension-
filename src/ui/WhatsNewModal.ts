import { App, Modal, Setting } from "obsidian";
import { getStrings } from "../utils/strings";

export class WhatsNewModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const t = getStrings();
    const { contentEl } = this;

    contentEl.empty();
    
    // Add custom class for premium styling
    contentEl.classList.add("heat-whats-new-modal");

    // Modal Header
    contentEl.createEl("h2", { 
      text: t.whatsNewTitle,
      cls: "heat-modal-header"
    });

    // Intro text
    contentEl.createEl("p", { 
      text: t.whatsNewIntro,
      cls: "heat-modal-intro"
    });

    // Features List
    const featuresList = contentEl.createEl("div", { cls: "heat-features-list" });

    const features = [
      { title: t.whatsNewFeature1Title, desc: t.whatsNewFeature1Desc },
      { title: t.whatsNewFeature2Title, desc: t.whatsNewFeature2Desc },
      { title: t.whatsNewFeature3Title, desc: t.whatsNewFeature3Desc },
      { title: t.whatsNewFeature4Title, desc: t.whatsNewFeature4Desc },
      { title: t.whatsNewFeature5Title, desc: t.whatsNewFeature5Desc },
      { title: t.whatsNewFeature6Title, desc: t.whatsNewFeature6Desc },
      { title: t.whatsNewFeature7Title, desc: t.whatsNewFeature7Desc },
      { title: t.whatsNewFeature8Title, desc: t.whatsNewFeature8Desc },
    ];

    features.forEach((feature) => {
      const featEl = featuresList.createEl("div", { cls: "heat-feature-item" });
      featEl.createEl("strong", { text: feature.title, cls: "heat-feature-title" });
      featEl.createEl("p", { text: feature.desc, cls: "heat-feature-desc" });
    });

    // Footer with Close Button
    new Setting(contentEl)
      .addButton((btn) => {
        btn
          .setButtonText(t.whatsNewClose)
          .setCta()
          .onClick(() => {
            this.close();
          });
        btn.buttonEl.classList.add("heat-modal-close-btn");
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
