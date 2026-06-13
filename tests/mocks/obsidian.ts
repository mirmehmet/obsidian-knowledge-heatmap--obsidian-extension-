export class App {
  vault = {
    getMarkdownFiles: () => [],
    adapter: {
      read: async () => "",
      write: async () => {},
      exists: async () => true,
    }
  };
  metadataCache = {
    getFileCache: () => null,
    resolvedLinks: {},
  };
  workspace = {
    on: () => ({}),
    getLeavesOfType: () => [],
  };
}

export class TFile {
  path = "";
  basename = "";
  extension = "";
  stat = {
    mtime: 0,
    size: 0,
  };
}

export class Plugin {
  app: App;
  manifest: any;
  constructor(app: App, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }
  async loadData() {
    return {};
  }
  async saveData() {}
  registerEvent() {}
}

export class Notice {
  constructor(message: string, duration?: number) {
    console.log("Notice:", message);
  }
}
