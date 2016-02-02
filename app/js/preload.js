(function () {
    var ipcRenderer = require('electron').ipcRenderer;
    var settings = require('remote').getGlobal('settings');

    var LIST_HREFS_QUERY = "a.zl-Uk-xf";

    // document.querySelectorAll("a.zl-Uk-xf")[0].innerText.trim()

    function getTaskLists() {
        var lists = null;

        var hrefs = document.querySelectorAll(LIST_HREFS_QUERY)
        if (hrefs.length > 0) {
            lists = [].map.call(hrefs, function (href) {
                return {
                    href: href["href"].replace("https://www.rememberthemilk.com/app/", ""),
                    name: href.innerText.replace(/\d+/, "").trim()
                }
            })
        }

        return lists;
    }

    function updatePendingTasks() {

        var listItem = document.querySelector('[href="#list/40296046"]');
        if (listItem) {
            var taskCountString = listItem.querySelector(".zl-Uk-yo").innerText;
            var taskCount = taskCountString != "" ? parseInt(taskCountString) : 0;
            ipcRenderer.send('updatePendingTasks', {count: parseInt(taskCount)});
        } else {
            console.error("List item not found")
        }
    }

    ipcRenderer.on('newTaskFocus', function () {
        console.log("received message: newTaskFocus");
        document.querySelector(".b-Hl-n-br-cr").focus();
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