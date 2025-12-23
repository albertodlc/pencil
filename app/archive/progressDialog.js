var titleText = null;
var detailText = null;
var percent = null;
var jobStarter = null;
var jobName = null;
var callback = null;

var returnValueHolder;
function handleOnload() {
    titleText = document.getElementById("titleText");
    detailText = document.getElementById("detailText");
    percent = document.getElementById("percent");

    jobName = window.arguments[0];
    jobStarter = window.arguments[1];
    callback = window.arguments[2];

    //setup
    document.title = Util.getMessage("progress.dialog.title");

    NDom.empty(titleText);
    titleText.appendChild(document.createTextNode(jobName + "..."));
    if (callback) {
        callback(jobName + "...");
    }
    NDom.empty(detailText);

    var dialog = document.documentElement;

    try {
        debug("about to call starter");
        jobStarter({
            onProgressUpdated: function (currentTask, done, total) {
                NDom.empty(detailText);
                detailText.appendChild(document.createTextNode(currentTask));
                var p = Math.round(done * 100 / total);
                percent.setAttribute("value", p);
                if (callback) {
                    callback(currentTask, p);
                }
            },
            onTaskDone: function () {
                if (callback) {
                    callback("");
                }
                window.close();
            }
        });
    } catch (e) {
        Util.error(Util.getMessage("error.title"), e.message,  Util.getMessage("button.close.label"));
        error(e);
    }
};
function handleOnCancel() {
    window.close();
    return false;
};

