/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AutoFilename
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  includeFolders: [],
  useHeader: true,
  useFirstLine: false,
  isTitleHidden: true,
  supportYAML: true,
  charCount: 50,
  checkInterval: 500
};
var renamedFileCount = 0;
var tempNewPaths = [];
var onTimeout = true;
var timeout;
var previousFile;
function inTargetFolder(file, settings) {
  var _a;
  if (settings.includeFolders.length === 0)
    return false;
  if (settings.includeFolders.includes((_a = file.parent) == null ? void 0 : _a.path))
    return true;
  return false;
}
var AutoFilename = class extends import_obsidian.Plugin {
  // Function for renaming files
  async renameFile(file, noDelay = false) {
    var _a, _b;
    if (!inTargetFolder(file, this.settings))
      return;
    if (noDelay === false) {
      if (onTimeout) {
        if (previousFile == file.path) {
          clearTimeout(timeout);
        }
        previousFile = file.path;
        timeout = setTimeout(() => {
          onTimeout = false;
          this.renameFile(file);
        }, this.settings.checkInterval);
        return;
      }
      onTimeout = true;
    }
    let content = await this.app.vault.cachedRead(file);
    if (this.settings.supportYAML && content.startsWith("---")) {
      let index = content.indexOf("---", 3);
      if (index != -1)
        content = content.slice(index + 3).trimStart();
    }
    if (this.settings.useHeader && content[0] == "#") {
      const headerArr = [
        "# ",
        "## ",
        "### ",
        "#### ",
        "##### ",
        "###### "
      ];
      for (let i = 0; i < headerArr.length; i++) {
        if (content.startsWith(headerArr[i])) {
          let index = content.indexOf("\n");
          if (index != -1)
            content = content.slice(i + 2, index);
          break;
        }
      }
    }
    const illegalChars = '\\/:*?"<>|#^[]';
    const illegalNames = [
      "CON",
      "PRN",
      "AUX",
      "NUL",
      "COM1",
      "COM2",
      "COM3",
      "COM4",
      "COM5",
      "COM6",
      "COM7",
      "COM8",
      "COM9",
      "COM0",
      "LPT1",
      "LPT2",
      "LPT3",
      "LPT4",
      "LPT5",
      "LPT6",
      "LPT7",
      "LPT8",
      "LPT9",
      "LPT0"
    ];
    let newFileName = "";
    for (let i = 0; i < content.length; i++) {
      if (i >= Number(this.settings.charCount)) {
        newFileName = newFileName.trimEnd();
        newFileName += "...";
        break;
      }
      let char = content[i];
      if (char === "\n") {
        if (this.settings.useFirstLine) {
          newFileName = newFileName.trimEnd();
          newFileName += "...";
          break;
        }
      }
      if (!illegalChars.includes(char))
        newFileName += char;
    }
    newFileName = newFileName.trim().replace(/\s+/g, " ");
    while (newFileName[0] == ".") {
      newFileName = newFileName.slice(1);
    }
    const isIllegalName = newFileName === "" || illegalNames.includes(newFileName.toUpperCase());
    if (isIllegalName)
      newFileName = "Untitled";
    const parentPath = ((_a = file.parent) == null ? void 0 : _a.path) === "/" ? "" : ((_b = file.parent) == null ? void 0 : _b.path) + "/";
    let newPath = `${parentPath}${newFileName}.md`;
    let counter = 1;
    let fileExists = this.app.vault.getAbstractFileByPath(newPath) != null;
    while (fileExists || tempNewPaths.includes(newPath)) {
      if (file.path == newPath)
        return;
      counter += 1;
      newPath = `${parentPath}${newFileName} (${counter}).md`;
      fileExists = this.app.vault.getAbstractFileByPath(newPath) != null;
    }
    if (noDelay) {
      tempNewPaths.push(newPath);
    }
    await this.app.fileManager.renameFile(file, newPath);
    renamedFileCount += 1;
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new AutoFilenameSettings(this.app, this));
    this.registerEvent(
      this.app.vault.on("modify", (abstractFile) => {
        if (abstractFile instanceof import_obsidian.TFile) {
          const noDelay = this.settings.checkInterval === 0;
          this.renameFile(abstractFile, noDelay);
        }
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        var _a;
        if (!file)
          return;
        if (!document.body.classList.contains("show-inline-title"))
          return;
        let shouldHide = this.settings.isTitleHidden && inTargetFolder(file, this.settings);
        const target = (_a = document.querySelector(".workspace-leaf.mod-active")) == null ? void 0 : _a.querySelector(".inline-title");
        if (!target)
          return;
        const customCss = "hide-inline-title";
        if (shouldHide && !target.classList.contains(customCss)) {
          target.classList.add(customCss);
        }
        if (!shouldHide && target.classList.contains(customCss)) {
          target.classList.remove(customCss);
        }
      })
    );
  }
};
var AutoFilenameSettings = class extends import_obsidian.PluginSettingTab {
  display() {
    this.containerEl.empty();
    new import_obsidian.Setting(this.containerEl).setName("Include").setDesc(
      "Folder paths where Auto Filename would auto rename files. Separate by new line. Case sensitive."
    ).addTextArea((text) => {
      text.setPlaceholder("/\nfolder\nfolder/subfolder").setValue(this.plugin.settings.includeFolders.join("\n")).onChange(async (value) => {
        this.plugin.settings.includeFolders = value.split("\n");
        await this.plugin.saveSettings();
      });
      text.inputEl.cols = 28;
      text.inputEl.rows = 4;
    });
    new import_obsidian.Setting(this.containerEl).setName("Use the header as filename").setDesc(
      "Use the header as filename if the file starts with a header"
    ).addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.useHeader).onChange(async (value) => {
        this.plugin.settings.useHeader = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(this.containerEl).setName("Only use the first line").setDesc(
      "Ignore succeeding lines of text when determining filename."
    ).addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.useFirstLine).onChange(async (value) => {
        this.plugin.settings.useFirstLine = value;
        await this.plugin.saveSettings();
      });
    });
    const shouldDisable = !document.body.classList.contains("show-inline-title");
    const description = shouldDisable ? 'Enable "Appearance > Interface > Show inline title" in options to use this setting.' : 'Override "Appearance > Interface > Show inline title" for files on the target folder.';
    new import_obsidian.Setting(this.containerEl).setName("Hide inline title for target folder").setDesc(description).addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.isTitleHidden).onChange(async (value) => {
        this.plugin.settings.isTitleHidden = value;
        await this.plugin.saveSettings();
      });
    }).setDisabled(shouldDisable).then(async (setting) => {
      if (shouldDisable) {
        setting.settingEl.style.opacity = "0.5";
        setting.controlEl.getElementsByTagName(
          "input"
        )[0].disabled = true;
        setting.controlEl.getElementsByTagName(
          "input"
        )[0].style.cursor = "not-allowed";
      } else {
        setting.settingEl.style.opacity = "1";
        setting.controlEl.getElementsByTagName(
          "input"
        )[0].disabled = false;
        setting.controlEl.getElementsByTagName(
          "input"
        )[0].style.cursor = "pointer";
      }
    });
    new import_obsidian.Setting(this.containerEl).setName("YAML support").setDesc("Enables YAML support.").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.supportYAML).onChange(async (value) => {
        this.plugin.settings.supportYAML = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(this.containerEl).setName("Character count").setDesc(
      "Auto Filename will use the first x number of characters in file as filename."
    ).addText(
      (text) => text.setPlaceholder(
        `10-100 (Default: ${DEFAULT_SETTINGS.charCount})`
      ).setValue(String(this.plugin.settings.charCount)).onChange(async (value) => {
        const numVal = Number(value);
        if (numVal >= 10 && numVal <= 100) {
          this.plugin.settings.charCount = numVal;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian.Setting(this.containerEl).setName("Check interval").setDesc(
      "Interval in milliseconds of how often to rename files while editing. Increase if there's performance issues."
    ).addText(
      (text) => text.setPlaceholder(
        `Default: ${DEFAULT_SETTINGS.checkInterval}`
      ).setValue(String(this.plugin.settings.checkInterval)).onChange(async (value) => {
        if (!isNaN(Number(value))) {
          this.plugin.settings.checkInterval = Number(value);
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian.Setting(this.containerEl).setName("Rename all files").setDesc(
      "Force rename all files on the target folder. Warning: To be safe, make sure you backup before proceeding."
    ).addButton(
      (button) => button.setButtonText("Rename").onClick(async () => {
        let filesToRename = [];
        this.app.vault.getMarkdownFiles().forEach((file) => {
          if (inTargetFolder(file, this.plugin.settings)) {
            filesToRename.push(file);
          }
        });
        new import_obsidian.Notice(`Renaming files, please wait...`);
        renamedFileCount = 0;
        tempNewPaths = [];
        await Promise.all(
          filesToRename.map(
            (file) => this.plugin.renameFile(file, true)
          )
        );
        new import_obsidian.Notice(
          `Renamed ${renamedFileCount}/${filesToRename.length} files.`
        );
      })
    );
  }
};

/* nosourcemap */