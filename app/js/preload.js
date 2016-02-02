(function () {
    var ipcRenderer = require('electron').ipcRenderer;

    function updatePendingTasks() {

        var listItem = document.querySelector('[href="#list/40296046"]');
        if (listItem) {
            var taskCountString = listItem.querySelector(".zl-Uk-yo").innerText;
            var taskCount = taskCountString != "" ? parseInt(taskCountString) : 0;
            ipcRenderer.send('updatePendingTasks', {count: parseInt(taskCount)});
        } else {
            console.log("List item not found")
        }
    }

    ipcRenderer.on('newTaskFocus', function () {
        console.log("received message: newTaskFocus");
        document.querySelector(".b-Hl-n-br-cr").focus();
    });

    console.log("Waiting for load");
    document.addEventListener('DOMContentLoaded', function () {
        console.log("Loaded!");

        updatePendingTasks();
        setInterval(updatePendingTasks, 5000);
    }, false);
})();