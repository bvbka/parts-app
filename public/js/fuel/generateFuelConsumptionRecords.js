async function generateFuelConsumptionRecords(fuelData) {

    var quadroRecords = document.querySelectorAll(".widget-quadro span:nth-child(1)");

    const average = array => array.reduce((a, b) => a + b) / array.length;

    var min = fuelData[0][1];
    var max = fuelData[0][1];
    var avg = parseFloat(average(fuelData.map(sub => sub[1])).toFixed(2));

    fuelData.forEach(element => {
        if (element[1] > max) max = element[1];
        else if (element[1] < min) min = element[1];
    });

    function longestStreakBelow(arr, threshold) {
        let maxLen = 0;
        let currentLen = 0;

        for (let val of arr) {
            if (val < threshold) {
                currentLen++;
                if (currentLen > maxLen) maxLen = currentLen;
            } else {
                currentLen = 0;
            }
        }

        return maxLen;
    }
    var recordsArray = [];
    recordsArray.push(min, max, avg, longestStreakBelow(fuelData.map(sub => sub[1]), acceptableFuelConsumption));

    for (let i = 0; i < quadroRecords.length; i++) {
        quadroRecords[i].innerHTML = recordsArray[i];
    }
}