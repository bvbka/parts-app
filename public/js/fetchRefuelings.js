var lineChartData = [];
const acceptableFuelConsumption = 11.5;

async function fetchRefuelings() {
    lineChartData = []; // <--- tu
    try {
        const response = await fetch('php/yourRefuelings.php');
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'index.html';
                return [];
            }
            throw new Error('Błąd sieci');
        }

        const refuelings = await response.json();
        const container = document.querySelectorAll('.appContainer')[1];
        container.innerHTML = '';

        async function updateCarMileage(refuelId, newMileage) {
            try {
                const res = await fetch('php/updateCarMileage.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ refuel_id: refuelId, new_mileage: newMileage })
                });
                const text = await res.text();
                if (text.trim() === 'OK') {
                    fetchRefuelings();
                    return true;
                } else {
                    console.error('Błąd z serwera:', text);
                    return false;
                }
            } catch (err) {
                console.error('Błąd sieci lub inny:', err);
                return false;
            }
        }

        async function getNextRefuelingReportIfExist(refuelId, carRegistrationId) {
            const res = await fetch('php/checkNextRefueling.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ refuel_id: refuelId, registration_id: carRegistrationId })
            });
            if (!res.ok) throw new Error('Błąd sieci');
            const txt = await res.text();
            return txt !== "Brak" ? parseFloat(txt) : 0;
        }

        function formatDateToPolish(dateString) {
            const [year, month, day] = dateString.split('-');
            const monthNames = ['', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
            return `${parseInt(day, 10)} ${monthNames[parseInt(month, 10)]}`;
        }

        function cutSeconds(timeString) {
            return timeString.split(':').slice(0, 2).join(':');
        }

        const promises = refuelings.map(async refuel => {
            const registrationSpan = document.createElement("span");
            registrationSpan.style.fontWeight = "bold";

            // pobranie rejestracji
            try {
                const formData = new FormData();
                formData.append("car_id", refuel.registration_id);
                const regRes = await fetch("php/get-registration.php", { method: "POST", body: formData });
                if (regRes.ok) registrationSpan.innerHTML = await regRes.text();
            } catch (e) { console.error(e); }

            const firstBoxLine = document.createElement("div");
            firstBoxLine.classList.add("first-box-line");
            const refuelingDate = document.createElement("span");
            refuelingDate.innerHTML = formatDateToPolish(refuel.refueling_date) + " " + cutSeconds(refuel.refueling_time);
            firstBoxLine.append(registrationSpan, refuelingDate);

            const secondBoxLine = document.createElement("div");
            secondBoxLine.classList.add("second-box-line");
            const carMileage = document.createElement("span");
            const checkIfCarMileageAfterEqualsZero = refuel.car_mileage_after == 0;
            carMileage.innerHTML = checkIfCarMileageAfterEqualsZero ? "Brak trasy" : (refuel.car_mileage_after - refuel.car_mileage) + " km";
            const totalLiters = document.createElement("span");
            totalLiters.innerHTML = "Spalanie nieznane";
            secondBoxLine.append(carMileage, totalLiters);

            const boxAdditionalInfo = document.createElement("div");
            boxAdditionalInfo.classList.add("additional-info");
            const additionalInfoMap = {
                "ID tankowania:": refuel.refuel_id,
                "Litry przed tankowaniem:": refuel.liters_before,
                "Litry po tankowaniu:": refuel.liters_after,
                "Przebieg przed trasą:": refuel.car_mileage,
                "Przebieg po trasie:": refuel.car_mileage_after
            };
            for (let key in additionalInfoMap) {
                const div = document.createElement("div");
                div.classList.add("additional-div");
                const title = document.createElement("span");
                const value = document.createElement("span");
                title.innerHTML = key;
                value.innerHTML = additionalInfoMap[key];
                div.append(title, value);
                boxAdditionalInfo.append(div);
            }

            if (checkIfCarMileageAfterEqualsZero) {
                const completeDiv = document.createElement("div");
                completeDiv.classList.add("complete-the-mileage");
                const input = document.createElement("input");
                input.type = "number";
                input.classList.add("update-car-mileage");
                const button = document.createElement("input");
                button.type = "button";
                button.value = "Uzupełnij przebieg po trasie";
                button.classList.add("primary-btn");
                button.addEventListener("click", () => updateCarMileage(refuel.refuel_id, input.value));
                completeDiv.append(input, button);
                boxAdditionalInfo.append(completeDiv);
            }

            // pobranie spalania
            const next = await getNextRefuelingReportIfExist(refuel.refuel_id, refuel.registration_id);
            if (next !== 0 && !checkIfCarMileageAfterEqualsZero) {
                let fuelConsumption = parseFloat(((next / (refuel.car_mileage_after - refuel.car_mileage)) * 100).toFixed(2));
                totalLiters.innerHTML = fuelConsumption + "l / 100km";
                if (fuelConsumption > acceptableFuelConsumption) totalLiters.classList.add("bad-fuel-consumption");
                else if (fuelConsumption < acceptableFuelConsumption) totalLiters.classList.add("good-fuel-consumption");
                lineChartData.push([refuel.refueling_date + " " + refuel.refueling_time, fuelConsumption]);
            }

            const div = document.createElement("div");
            div.className = "box";
            div.append(firstBoxLine, secondBoxLine, boxAdditionalInfo);
            container.appendChild(div);

            return [refuel.refueling_date + " " + refuel.refueling_time, next !== 0 && !checkIfCarMileageAfterEqualsZero ? parseFloat(((next / (refuel.car_mileage_after - refuel.car_mileage)) * 100).toFixed(2)) : null];
        });

        const results = await Promise.all(promises);

        // kliknięcie w box pokazujące additional-info
        document.querySelectorAll('.appContainer .box').forEach(box => {
            box.addEventListener('click', function (e) {
                if (['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'LABEL'].includes(e.target.tagName)) {
                    e.stopPropagation();
                    return;
                }
                let additionalInfo = box.querySelector(".additional-info");
                additionalInfo.style.display = (additionalInfo.style.display === "flex") ? "none" : "flex";
            });
        });

        return results.filter(r => r[1] !== null);

    } catch (error) {
        console.error('Błąd:', error);
        return [];
    }

}
