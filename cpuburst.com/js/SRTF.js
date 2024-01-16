class Process {
    constructor(processIdx, processName, arrivalTime, burstTime) {
        this.processName = processName;
        this.burstTime = burstTime;
        this.initialBurst = burstTime;
        this.arrivalTime = arrivalTime;
        this.done = false;
        this.hasStarted = false;
        this.finishTime;
        this.processIdx = processIdx;
    }
}

class Progress {
    constructor() {
        this.indexes = [];
        this.names = [];
        this.sum = 0;
    }
}

var bar = new Progress();
const processArray = [];
var contexSwitch = 0;
let position = 0;
const data = [
    [3, 4],
    [5, 9],
    [8, 4],
    [0, 7],
    [12, 6],
]

function addItem(name, progressLength) {
    var previousName = bar.names[bar.names.length - 1];

    console.log(bar.names.length)
    console.log(bar.indexes.length)

    //if the process being added is the same as the current one, combine them
    if (bar.names.length > 0 && previousName == name) {
        bar.indexes[bar.indexes.length - 1] += progressLength;
        bar.sum += progressLength;
        position += progressLength;
    }
    else {
        if (
            (
                previousName != "idle" &&
                previousName != "context switch" &&
                name != "idle" &&
                position != 0 &&
                contexSwitch > 0
            ) ||
            (
                name == "idle" &&
                progressLength <= contexSwitch &&
                position != 0
            )
        ) {
            bar.indexes[bar.indexes.length] = contexSwitch;
            bar.names[bar.names.length] = "context switch";
            bar.sum += contexSwitch;
            position += contexSwitch;
            position = position;
        }
        if ((name == "idle" && progressLength <= contexSwitch && position != 0) == false) {
            bar.indexes[bar.indexes.length] = progressLength;
            bar.names[bar.names.length] = name;
            bar.sum += progressLength;
            position += progressLength;
        }
    }

}

function sortArriveTimes() {
    function compareArrivals(process1, process2) {
        if (process1.arrivalTime > process2.arrivalTime) {
            return 1;
        } else if (process1.arrivalTime < process2.arrivalTime) {
            return -1;
        } else {
            return 0;
        }
    }

    processArray.sort(compareArrivals);
}

function isDone() {
    for (var i = 0; i < processArray.length; i++) {
        if (processArray[i].done == false) {
            return false
        }
    }

    return true;
}

function fillGaps() {
    for (var i = 0; i < processArray.length; i++) {
        if (processArray[i].done == false) {
            if (processArray[i].arrivalTime > position) {
                addItem("idle", processArray[i].arrivalTime - position);
            }
            break;
        }
    }
}

function loadValues(processes) {
    for (let i = 0; i < processes.length; i++) {
        const [arrivalTime, burstTime] = processes[i];
        const process = new Process(i, `P${i + 1}`, arrivalTime, burstTime)
        processArray.push(process);
    }
}

function findSmallestBurstIndex() {
    var smallestIndex = 0;
    var smallestBurst = 0;

    //finds an initial burst time
    for (var i = 0; i < processArray.length; i++) {
        if (processArray[i].done == false && processArray[i].arrivalTime <= position) {
            smallestIndex = i;
            smallestBurst = processArray[i].burstTime;
            break;
        }
    }

    //looks through the array to find a smaller burst time
    for (var i = smallestIndex; i < processArray.length; i++) {
        if (processArray[i].burstTime < smallestBurst && processArray[i].done == false && processArray[i].arrivalTime <= position) {
            smallestIndex = i;
            smallestBurst = processArray[i].burstTime;
        }

    }

    return smallestIndex;
}

function SRJF() {
    // Sort processes by arrival time
    sortArriveTimes();

    while (isDone() == false) {
        fillGaps();
        var i = findSmallestBurstIndex();
        findNextJump(i);
    }
}

function findNextJump(proccessIndex) {
    var interruptFound = false;

    for (var i = 0; i < processArray.length; i++) {
        if (
            processArray[i].done == false &&
            processArray[i].arrivalTime < position + processArray[proccessIndex].burstTime &&
            processArray[i].arrivalTime > processArray[proccessIndex].arrivalTime &&
            processArray[i].burstTime < processArray[proccessIndex].burstTime &&
            i != proccessIndex &&
            processArray[i].hasStarted == false
        ) {
            processArray[proccessIndex].burstTime -= processArray[i].arrivalTime - position;
            addItem(processArray[proccessIndex].processName, processArray[i].arrivalTime - position);
            processArray[proccessIndex].hasStarted = true;
            interruptFound = true;
            break;
        }
    }

    if (interruptFound == false) {
        addItem(processArray[proccessIndex].processName, processArray[proccessIndex].burstTime);
        processArray[proccessIndex].done = true;
        processArray[proccessIndex].finishTime = position;
    }

}

function run(processes) {
    sortArriveTimes();
    loadValues(processes);
    SRJF();
}

run(data);

console.log(processArray[4]);