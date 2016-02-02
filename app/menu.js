(function (scope) {
    "use strict";

    module.exports = [
        {
            label: 'Task nagger',
            submenu: [
                {
                    label: 'Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: function () {
                        global.settings.init();
                    }
                },
                {type: 'separator'},
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function() { global.taskNagger.window.reload(); }
                },
                {
                    label: 'Toggle DevTools',
                    accelerator: 'Alt+CmdOrCtrl+I',
                    click: function() { global.taskNagger.window.toggleDevTools(); }
                }
            ]
        }];
})(this);
