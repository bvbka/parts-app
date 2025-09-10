async function fetchLeaves() {
    try {
        const response = await fetch('php/leaves/yourLeaves.php');
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'index.html';
                return [];
            }
            throw new Error('Błąd sieci');
        }

        const leaves = await response.json();
        const container = document.querySelectorAll('.appContainer')[0];
        container.innerHTML = '';

        function formatDateToPolish(dateString) {
            const [year, month, day] = dateString.split('-');
            const monthNames = ['', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
            return `${parseInt(day, 10)} ${monthNames[parseInt(month, 10)]}`;
        }

        function daysBetweenInclusive(date1, date2) {
            const d1 = new Date(date1);
            const d2 = new Date(date2);

            d1.setHours(0, 0, 0, 0);
            d2.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(d2 - d1);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return diffDays + 1;
        }

        function daysFromTodayToEnd(startDate, endDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const dStart = new Date(startDate);
            const dEnd = new Date(endDate);

            dStart.setHours(0, 0, 0, 0);
            dEnd.setHours(0, 0, 0, 0);

            // upewniamy się, że today jest w zakresie
            if (today < dStart) return daysBetweenInclusive(dStart, dEnd);
            if (today > dEnd) return 0;

            return daysBetweenInclusive(today, dEnd);
        }

        function calculateRemainingTimePercentage(startDate, endDate) {
            const allDays = daysBetweenInclusive(startDate, endDate);
            const remainingDays = daysFromTodayToEnd(startDate, endDate);

            const percentage = (remainingDays / allDays) * 100;

            return percentage;
        }

        function percentToColor(percent) {
            // stałe - możesz je sobie zmienić
            const RED = [222, 78, 78];
            const YELLOW = [222, 217, 78];
            const GREEN = [78, 222, 102];

            // upewniamy się, że percent mieści się w zakresie
            percent = Math.max(0, Math.min(100, percent));

            let start, end, ratio;

            if (percent <= 50) {
                // interpolacja czerwony -> żółty
                start = RED;
                end = YELLOW;
                ratio = percent / 50;
            } else {
                // interpolacja żółty -> zielony
                start = YELLOW;
                end = GREEN;
                ratio = (percent - 50) / 50;
            }

            const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
            const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
            const b = Math.round(start[2] + (end[2] - start[2]) * ratio);

            return `rgb(${r}, ${g}, ${b})`;
        }

        leaves.forEach(leave => {
            console.log(leave);
            const leaveTypeSpan = document.createElement("span");
            leaveTypeSpan.style.fontWeight = "bold";
            leaveTypeSpan.style.width = "100%";
            leaveTypeSpan.style.textAlign = "center";
            leaveTypeSpan.innerHTML = leave.type + " (" + daysBetweenInclusive(leave.start_date, leave.end_date) + " dni)";

            const firstBoxLine = document.createElement("div");
            firstBoxLine.classList.add("first-box-line");
            firstBoxLine.append(leaveTypeSpan);

            const secondBoxLine = document.createElement("div");
            secondBoxLine.classList.add("second-box-line");
            secondBoxLine.style.flexDirection = "column";

            const leaveRemainingTimeBar = document.createElement("div");
            leaveRemainingTimeBar.classList.add("remaining-time-bar");

            const leaveRemainingTimeInnerBar = document.createElement("div");
            leaveRemainingTimeInnerBar.classList.add("remaining-time-inner-bar");
            leaveRemainingTimeInnerBar.style.width = calculateRemainingTimePercentage(leave.start_date, leave.end_date) + "%";
            leaveRemainingTimeInnerBar.style.backgroundColor = percentToColor(calculateRemainingTimePercentage(leave.start_date, leave.end_date));
            leaveRemainingTimeBar.append(leaveRemainingTimeInnerBar);

            const leaveDatesDiv = document.createElement("div");
            leaveDatesDiv.style.display = "flex";
            leaveDatesDiv.style.justifyContent = "space-between";
            const leaveStartDateSpan = document.createElement("span");
            const leaveEndDateSpan = document.createElement("span");

            leaveStartDateSpan.innerHTML = formatDateToPolish(leave.start_date);
            leaveEndDateSpan.innerHTML = formatDateToPolish(leave.end_date);

            leaveDatesDiv.append(leaveStartDateSpan, leaveEndDateSpan);

            secondBoxLine.append(leaveRemainingTimeBar, leaveDatesDiv);

            const div = document.createElement("div");
            div.className = "box";
            div.append(firstBoxLine, secondBoxLine);
            container.appendChild(div);
        });

    } catch (error) {
        console.error('Błąd:', error);
    }

}
fetchLeaves();