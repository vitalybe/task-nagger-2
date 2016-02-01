(function () {
    var ipc = require('ipc');
    var ipcRenderer = require('electron').ipcRenderer;

    console.log("Waiting for load");
    document.addEventListener('DOMContentLoaded', function () {
        console.log("Loaded!");
        ipcRenderer.send('updatePendingTasks', {count: 4});

    }, false);
})();