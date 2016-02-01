(function (scope) {
    "use strict";

    var app = require('app');
    var AppMenu = require('menu');
    var MenuItem = require('menu-item');
    var AppTray = require('tray');
    var fileSystem = require('fs');
    var NativeImage = require('native-image');
    var BrowserWindow = require('browser-window');
    var join = require('path').join;
    const ipcMain = require('electron').ipcMain;

    global.onlyOSX = function (callback) {
        if (process.platform === 'darwin') {
            return Function.bind.apply(callback, this, [].slice.call(arguments, 0));
        }
        return function () {
        };
    };

    global.onlyWin = function (callback) {
        if (process.platform === 'win32' || process.platform === 'win64') {
            return Function.bind.apply(callback, this, [].slice.call(arguments, 0));
        }
        return function () {
        };
    };

    global.config = {
        defaultSettings: {
            width: 1000,
            height: 720,
            thumbSize: 0
        },
        currentSettings: {},
        init: function () {
            config.loadConfiguration();
        },
        loadConfiguration: function () {
            var settingsFile = app.getDataPath() + "/settings.json";
            try {
                var data = fileSystem.readFileSync(settingsFile);
                config.currentSettings = JSON.parse(data);
            } catch (e) {
                config.currentSettings = config.defaultSettings;
            }
        },
        applyConfiguration: function () {
            taskNagger.window.webContents.on('dom-ready', function (event, two) {
                var noAvatar = '.chat-avatar{display: none}';
                var noPreview = '.chat-secondary .chat-status{z-index: -999;}';

                var thumbSize = '.image-thumb { width: ' + config.currentSettings.thumbSize + 'px  !important;' +
                    'height: ' + config.currentSettings.thumbSize + 'px !important;}' +
                    '.image-thumb img.image-thumb-body { width: auto !important;' +
                    'height: ' + config.currentSettings.thumbSize + 'px !important;}';

                if (config.currentSettings.hideAvatars) {
                    this.insertCSS(noAvatar);
                }
                if (config.currentSettings.hidePreviews) {
                    this.insertCSS(noPreview);
                }

                if (config.currentSettings.thumbSize) {
                    this.insertCSS(thumbSize);
                }
            });

            if (config.get("useProxy")) {
                var session = taskNagger.window.webContents.session;
                var httpProxy = config.get("httpProxy");
                var httpsProxy = config.get("httpsProxy") || httpProxy;
                if (httpProxy) {
                    session.setProxy("http=" + httpProxy + ";https=" + httpsProxy, function () {
                    });
                }
            }
        },
        saveConfiguration: function () {
            fileSystem.writeFileSync(app.getDataPath() + "/settings.json", JSON.stringify(config.currentSettings), 'utf-8');
        },
        get: function (key) {
            return config.currentSettings[key];
        },
        set: function (key, value) {
            config.currentSettings[key] = value;
        },
        unSet: function (key) {
            if (config.currentSettings.hasOwnProperty(key)) {
                delete config.currentSettings[key];
            }
        }
    };

    global.taskNagger = {
        init: function () {
            taskNagger.createMenu();
            taskNagger.createTray();

            taskNagger.clearCache();
            config.init();
            taskNagger.openWindow();
            config.applyConfiguration();
        },
        createMenu: function () {
            taskNagger.menu = AppMenu.buildFromTemplate(require('./menu'));
            AppMenu.setApplicationMenu(taskNagger.menu);
        },
        createTray: function () {
            taskNagger.tray = new AppTray(__dirname + '/assets/img/trayTemplate.png');

            taskNagger.tray.on('clicked', function () {
                taskNagger.window.show();
            });

            taskNagger.tray.setToolTip('Task nagger 2');
        },
        clearCache: function () {
            try {
                fileSystem.unlinkSync(app.getPath('appData') + '/Application Cache/Index');
            } catch (e) {
            }
        },
        openWindow: function () {
            taskNagger.window = new BrowserWindow({
                "y": config.get("posY"),
                "x": config.get("posX"),
                "width": config.get("width"),
                "height": config.get("height"),
                "min-width": 600,
                "min-height": 600,
                "type": "toolbar",
                "node-integration": false,
                "preload": join(__dirname, 'js', 'preload.js'),
                "title": "Task nagger 2",
                "icon": "app/assets/img/icon.png"
            });

            taskNagger.window.loadUrl('https://www.rememberthemilk.com/app/', {
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.52 Safari/537.36'
            });

            if (config.get("useProxy")) {
                var session = taskNagger.window.webContents.session;
                var httpProxy = config.get("httpProxy");
                var httpsProxy = config.get("httpsProxy") || httpProxy;
                if (httpProxy) {
                    session.setProxy("http=" + httpProxy + ";https=" + httpsProxy, function () {
                    });
                }
            }

            taskNagger.window.show();

            taskNagger.window.webContents.on("new-window", function (e, url) {
                require('shell').openExternal(url);
                e.preventDefault();
            });

            taskNagger.window.on('close', onlyOSX(function (e) {
                if (taskNagger.window.forceClose !== true) {
                    e.preventDefault();
                    taskNagger.window.hide();
                }
            }));

            taskNagger.window.on("close", function () {
                if (settings.window) {
                    settings.window.close();
                    settings.window = null;
                }
                //save the window position
                config.set("posX", this.getBounds().x);
                config.set("posY", this.getBounds().y);
                config.set("width", this.getBounds().width);
                config.set("height", this.getBounds().height);
                config.saveConfiguration();
            });

            app.on('before-quit', onlyOSX(function () {
                taskNagger.window.forceClose = true;
            }));

            app.on('activate-with-no-open-windows', onlyOSX(function () {
                taskNagger.window.show();
            }));

            app.on('window-all-closed', onlyWin(function () {
                app.quit();
            }));

            ipcMain.on('updatePendingTasks', function () {
                var regularNagInterval = null;
                var isBlink = false;
                var lastCount = 0;

                return function (event, data) {
                    if (data.count === lastCount) {
                        return;
                    }

                    lastCount = data.count;
                    var badgeCount = (lastCount > 9 ? 0 : lastCount);
                    var badge = NativeImage.createFromPath(app.getAppPath() + "/assets/badges/badge-" + badgeCount + ".png");

                    if (lastCount >= 0 && !regularNagInterval) {
                        regularNagInterval = setInterval(function () {
                            if (isBlink) {
                                taskNagger.window.setOverlayIcon(badge, "Pending tasks");
                            } else {
                                taskNagger.window.setOverlayIcon(null, '');
                            }

                            isBlink = !isBlink;
                        }, 500);
                    } else if(lastCount === 0) {
                        taskNagger.window.setOverlayIcon(null, '');
                        clearInterval(regularNagInterval);
                        regularNagInterval = null;
                        isBlink = false;
                    }
                }
            }());

        }
    };

    global.settings = {
        init: function () {
            // if there is already one instance of the window created show that one
            if (settings.window) {
                settings.window.show();
            } else {
                settings.openWindow();
                settings.createMenu();
            }
        },
        createMenu: function () {
            settings.menu = new AppMenu();
            settings.menu.append(new MenuItem(
                {
                    label: "close",
                    visible: false,
                    accelerator: "esc",
                    click: function () {
                        settings.window.close();
                    }
                })
            );
            settings.menu.append(new MenuItem(
                {
                    label: 'Toggle DevTools',
                    accelerator: 'Alt+CmdOrCtrl+O',
                    visible: false,
                    click: function () {
                        settings.window.toggleDevTools();
                    }
                })
            );
            settings.menu.append(new MenuItem(
                {
                    label: 'Reload settings view',
                    accelerator: 'CmdOrCtrl+r',
                    visible: false,
                    click: function () {
                        settings.window.reload();
                    }
                })
            );
            settings.window.setMenu(settings.menu);
            settings.window.setMenuBarVisibility(false);
        },
        openWindow: function () {
            settings.window = new BrowserWindow(
                {
                    "width": 500,
                    "height": 500,
                    "resizable": false,
                    "center": true,
                    "frame": false
                }
            );

            settings.window.loadUrl("file://" + __dirname + "/html/settings.html");
            settings.window.show();

            settings.window.on("close", function () {
                settings.window = null;
            });
        }
    };

    app.on('ready', function () {
        taskNagger.init();
    });
})(this);
