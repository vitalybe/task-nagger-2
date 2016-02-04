(function () {
    var ipcRenderer = require('electron').ipcRenderer;
    var settings = require('remote').getGlobal('settings');
    var config = require('remote').getGlobal('config');

    var LIST_HREFS_QUERY = "a.zl-Uk-xf";
    var ADD_TASK_STRING = "Add a task...";

    function getListData(listElement) {
        return listElement.innerText.trim().split("\n");
    }

    function getListTaskCount(listElement) {
        return getListData(listElement)[0];
    }

    function getListName(listElement) {
        return getListData(listElement)[1];
    }

    function getTaskLists() {
        var lists = null;

        var hrefs = document.querySelectorAll(LIST_HREFS_QUERY)
        if (hrefs.length > 0) {
            lists = [].map.call(hrefs, function (href) {
                return {
                    href: href["href"].replace("https://www.rememberthemilk.com/app/", ""),
                    name: getListName(href)
                }
            })
        }

        return lists;
    }

    function updatePendingTasks() {
        var trackedListHref = config.get("trackedList");
        var trackedListElement = trackedListHref ? document.querySelector('[href="' + trackedListHref + '"]') : null;
        if (trackedListElement) {
            var taskCountString = getListTaskCount(trackedListElement);
            var taskCount = taskCountString != "" ? parseInt(taskCountString) : 0;
            ipcRenderer.send('updatePendingTasks', {count: parseInt(taskCount)});
        } else {
            console.error("List item not found")
        }
    }

    ipcRenderer.on('newTaskFocus', function () {
        console.log("received message: newTaskFocus");
        var contentEditableElements = document.querySelectorAll("[contenteditable]");
        var addTaskInput = [].filter.call(contentEditableElements, function (e) {
            return e.parentElement.parentElement.innerText.trim() == ADD_TASK_STRING
        });
        if(addTaskInput.length != 1) {
            throw new Error("Failed to find new task input");
        }

        addTaskInput[0].focus();
    });

    console.log("Waiting for DOMContentLoaded");
    document.addEventListener('DOMContentLoaded', function () {
        console.log("DOMContentLoaded event");

        // pass in the target node, as well as the observer options
        var observer = new MutationObserver(function (mutations) {
            console.log("Mutations occurred: ", mutations.length);
            var lists = getTaskLists();
            if (lists) {
                console.log("Lists were found");
                settings.setLists(lists);
                updatePendingTasks();
                setInterval(updatePendingTasks, 5000);
                this.disconnect();
            }
        });

        var config = {attributes: true, childList: true, characterData: true};
        observer.observe(document.querySelector("body"), config);

    }, false);
})();