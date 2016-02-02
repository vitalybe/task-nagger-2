var taskNagger = require('remote').getGlobal("taskNagger");
var settings = require('remote').getGlobal('settings');
var config = require('remote').getGlobal('config');
var SettingsView = {
    bindEvents: function () {
        $this = this;
        $("#save-button").on("click", function (e) {
            e.preventDefault();
            if ($(".invalid").length > 0) {
                return;
            }
            $this.saveSettings();
            settings.window.close();
        });

        $("#close-button").on("click", function () {
            settings.window.close();
        });

        $("#useProxy").on("change", function () {
            $("#httpProxy").prop("disabled", !($("#useProxy").is(":checked")));
            $("#httpsProxy").prop("disabled", !($("#useProxy").is(":checked")));
        });
    },

    init: function () {

        for (var i = 0; i < settings.lists.length; i++) {
            jQuery('<p>' +
                '<input class="with-gap" name="lists" type="radio" id="list_'+i+'" value="'+settings.lists[i].href+'"/>' +
                '<label for="list_'+i+'">'+settings.lists[i].name+'</label>' +
                '</p>').appendTo('#taskLists');
        }


        var trackedListHref = config.get("trackedList");
        var selectedList = $('input[name="lists"][value="'+trackedListHref+'"]');
        if(selectedList.length) {
            selectedList.attr("checked", true);
        } else {
            console.log("no list was chosen")
        }

        $("#useProxy").attr("checked", config.get("useProxy"));
        $("#httpProxy").val(config.get("httpProxy"));
        $("#httpsProxy").val(config.get("httpsProxy"));
        $("#httpProxy").prop("disabled", !($("#useProxy").is(":checked")));
        $("#httpsProxy").prop("disabled", !($("#useProxy").is(":checked")));

        this.bindEvents();
    },

    saveSettings: function () {
        var checkedList = $('input[name="lists"]:checked');
        if(checkedList.length) {
            config.set("trackedList", checkedList.val())
        }

        if ($("#useProxy").is(":checked")) {
            config.set("useProxy", $("#useProxy").is(":checked"));
            config.set("httpProxy", $("#httpProxy").val());
            config.set("httpsProxy", $("#httpsProxy").val());
        } else {
            config.unSet("useProxy");
            config.unSet("httpProxy");
            config.unSet("httpsProxy");
        }
        config.saveConfiguration();
        config.applyConfiguration();
        taskNagger.window.reload();
    }
};

$(document).ready(function () {
    SettingsView.init();
});
