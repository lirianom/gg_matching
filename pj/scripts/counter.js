var i = 10;

function timedCount() {
    i = i - 1;
    postMessage(i);
    setTimeout("timedCount()",1000);
}

timedCount();
