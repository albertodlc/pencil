"use strict";

const { app, protocol, shell, BrowserWindow} = require("electron");
const { MacOSToolbar } = require('./views/toolbars/MacOSToolbar');

const fs       = require("fs");
const path     = require("path");
const os       = require("os");

app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("allow-file-access-from-files", "1");
app.commandLine.appendSwitch("allow-file-access", "1");
app.commandLine.appendSwitch("disable-smooth-scrolling");
app.commandLine.appendSwitch("disable-site-isolation-trials");

const remoteMain = require("@electron/remote/main");
remoteMain.initialize();

const PLATFORM = process.platform.trim().toLowerCase();

const iconFile = PLATFORM == "win32" ? "app.ico" : "css/images/logo-shadow.png";
const mainWindowProperties = {
    title: app.name, // FIXME: On Linux is not correct - it uses the html title name
    autoHideMenuBar: true,
    webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: true,
        allowDisplayingInsecureContent: true,
        defaultEncoding: "UTF-8",
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        experimentalFeatures: true,
        disableDialogs: true,
        enableBlinkFeatures: "FontAccess"
    },
    icon: path.join(__dirname, iconFile)
};

function getAppConfig(name) {
    var p = path.join(path.join(os.homedir(), ".pencil"), "config.json");
    try {
        var json = fs.readFileSync(p, "utf8");
        var data = JSON.parse(json);
        return data[name];
    } catch (e) {
        return undefined;
    }
}

// Disable hardware acceleration by default for Linux
// TODO: implement a setting for this one and requires a restart after changing that value
if (PLATFORM == "linux" && app.disableHardwareAcceleration) {
    var useHWAConfig = getAppConfig("core.useHardwareAcceleration");
    console.log("useHWAConfig: ", useHWAConfig);
    if (process.argv.indexOf("--with-hwa") < 0 && !useHWAConfig) {
        console.log("**************** Hardware acceleration disabled for Linux.");
        app.disableHardwareAcceleration();
    } else {
        console.log("Hardware acceleration forcibly enabled.");
    }
}

global.sharedObject = { appArguments: process.argv };

const handleRedirect = (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
}

var mainWindow = null;
const createWindow = () => {
    mainWindow = new BrowserWindow(mainWindowProperties);
    remoteMain.enable(mainWindow.webContents)

    let devEnable = false;
    let entrypoint = __dirname + "/app.xhtml";

    // ! DEBUG console
    if (process.argv.includes("--enable-dev")) {
        devEnable = true;
    } else if (process.env.PENCIL_ENV === "development") {
        devEnable = true;
    }

    // ! RENDER new app
    if( process.argv.includes('--new-app') ){
        entrypoint = __dirname + "/appNew/app.html"
    }

    app.devEnable = devEnable;

    if (devEnable) {
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.setMenu(null);
    }

    mainWindow.loadFile(entrypoint);

    mainWindow.on("closed", function() {
        mainWindow = null;
        app.exit(0);
    });

    if (PLATFORM == 'darwin') {
        MacOSToolbar.createMacOSToolbar();
    }

    mainWindow.maximize();
    mainWindow.webContents.on("will-navigate", handleRedirect);
    mainWindow.webContents.on("new-window", handleRedirect);

    app.mainWindow = mainWindow;
    globalThis.mainWindow = mainWindow;

    // const updater = require('./updater');
    // setTimeout(function() {
    //     updater.checkForUpdates();
    // }, 3000);
}

// Quit when all windows are closed.
app.on("window-all-closed", function() {
    if (PLATFORM !== "darwin") {
        app.quit();
    }
});

app.on('ready', function() {
    protocol.registerBufferProtocol("ref", function(request, callback) {
        var path = request.url.substr(6);

        fs.readFile(path, function (err, data) {
            if (err) {
                callback({mimeType: "text/html", data: Buffer.from("Not found")});
            } else {
                callback({mimeType: "image/jpeg", data: Buffer.from(data)});
            }
        });

    });


    // Create the browser window.
    createWindow();

    const renderer = require("./pencil-core/common/renderer");
    renderer.start();

    const webPrinter = require("./pencil-core/common/webPrinter");
    webPrinter.start();

    const globalShortcutMainService = require("./tools/global-shortcut-main.js");
    globalShortcutMainService.start();
});

app.on("activate", function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    } else {
        app.show();
    }
});

app.on("will-quit", function () {
  require("electron").globalShortcut.unregisterAll()
});

process.on('uncaughtException', function (error) {
    console.error(error);
});