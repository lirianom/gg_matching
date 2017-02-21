var w;

function startWorker() {
    console.log("started");
    if(typeof(Worker) !== "undefined") {
        if(typeof(w) == "undefined") {
            w = new Worker("demo_workers.js");
        }
        w.onmessage = function(event) {
            document.getElementById("count").innerHTML = event.data;
        };
    } else {
        document.getElementById("count").innerHTML = "Sorry, your browser does not support Web Workers...";
    }
}

function stopWorker() { 
    w.terminate();
    w = undefined;
}

