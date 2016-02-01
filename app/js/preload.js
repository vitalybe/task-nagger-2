(function () {
    var ipcRenderer = require('electron').ipcRenderer;

    function updatePendingTasks() {

        var listItem = document.querySelector('[href="#list/40296046"]');
        if (listItem) {
            var taskCountString = listItem.querySelector(".zl-Uk-yo").innerText;
            var taskCount = taskCountString != "" ? parseInt(taskCountString) : 0;
            ipcRenderer.send('updatePendingTasks', {count: parseInt(taskCount)});
        } else {
            console.warn("List item not found")
        }
    }

    console.log("Waiting for load");
    document.addEventListener('DOMContentLoaded', function () {
        console.log("Loaded!");

        updatePendingTasks();
        setInterval(updatePendingTasks, 5000);
    }, false);
})();