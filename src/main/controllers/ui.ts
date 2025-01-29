import { app, BrowserWindow } from "electron";
import { BaseController } from ".";
import { mainWindow } from "..";

export class UiController extends BaseController<"ui"> {
  constructor() {
    super("ui", {});
    this.expose({
      openWindow: url => this.openWindow(url),
      minimizeMainWindow: () => this.minimizeMainWindow(),
      maximizeMainWindow: () => this.maximizeMainWindow(),
      closeApp: () => this.closeApp()
    })
  }

  async maximizeMainWindow() {
    if(mainWindow?.isMaximized() === true) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  }

  async minimizeMainWindow() {
    mainWindow?.minimize()
  }

  async closeApp() {
    app.exit();
  }

  async openWindow(url: string) {
    const auxWindow = new BrowserWindow({
      height: 600,
      width: 800,
    });

    auxWindow.loadURL(url);
  }
  
}