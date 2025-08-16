async function fetchRefuelings() {

    const acceptableFuelConsumption = 10.5;

    try {
        var response = await fetch('php/yourRefuelings.php');
        if (!response.ok) {
            if (response.status === 401) {
                // Jeśli nie jest zalogowany, przekieruj
                window.location.href = 'index.html';
                return;
            }
            throw new Error('Błąd sieci');
        }
        const refuelings = await response.json();
        const container = document.querySelectorAll('.appContainer')[1];
        container.innerHTML = '';

        async function updateCarMileage(refuelId, newMileage) {
            try {
                const response = await fetch('php/updateCarMileage.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ refuel_id: refuelId, new_mileage: newMileage })
                });

                const text = await response.text();

                if (text.trim() === 'OK') {
                    fetchRefuelings();
                    return true;  // sukces
                } else {
                    console.error('Błąd z serwera:', text);
                    return false; // błąd
                }
            } catch (err) {
                console.error('Błąd sieci lub inny:', err);
                return false;
            }
        }

        async function getNextRefuelingReportIfExist(refuelId, carRegistrationId) {
            const response = await fetch('php/checkNextRefueling.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ refuel_id: refuelId, registration_id: carRegistrationId })
            });
            if (!response.ok) throw new Error('Błąd sieci');

            const test = await response.text();
            return test != "Brak" ? parseFloat(test) : 0;
        }

        function formatDateToPolish(dateString) {
            const [year, month, day] = dateString.split('-');
            const monthNames = [
                '', // żeby indeks 1 był dla stycznia
                'stycznia', 'lutego', 'marca', 'kwietnia',
                'maja', 'czerwca', 'lipca', 'sierpnia',
                'września', 'października', 'listopada', 'grudnia'
            ];

            const dayNum = parseInt(day, 10); // usunięcie zera wiodącego
            const monthNum = parseInt(month, 10);

            return `${dayNum} ${monthNames[monthNum]}`;
        }

        function cutSeconds(timeString) {
            return timeString.split(':').slice(0, 2).join(':');
        }

        refuelings.forEach(refuel => {
            const div = document.createElement('div');
            div.className = 'box';

            var additionalInfoMap = {
                "ID tankowania:": refuel.refuel_id,
                "Litry przed tankowaniem:": refuel.liters_before,
                "Litry po tankowaniu:": refuel.liters_after,
                "Przebieg przed trasą:": refuel.car_mileage,
                "Przebieg po trasie:": refuel.car_mileage_after
            }

            var checkIfCarMileageAfterEqualsZero = true;
            if (refuel.car_mileage_after != 0) checkIfCarMileageAfterEqualsZero = false;

            const firstBoxLine = document.createElement("div");
            firstBoxLine.classList.add("first-box-line");

            const registrationNumber = document.createElement("span");

            async function getRegistration() {
                try {
                    const carId = refuel.registration_id;

                    const formData = new FormData();
                    formData.append("car_id", carId);

                    const response = await fetch("php/get-registration.php", {
                        method: "POST",
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error("Błąd sieci lub serwera: " + response.status);
                    }

                    let registration = await response.text();

                    registrationNumber.innerHTML = registration;

                } catch (error) {
                    console.error("Wystąpił błąd:", error);
                }
            }

            // Wywołanie
            getRegistration();
            registrationNumber.style.fontWeight = "bold";

            const refuelingDate = document.createElement("span");
            refuelingDate.innerHTML = formatDateToPolish(refuel.refueling_date) + " " + cutSeconds(refuel.refueling_time);

            firstBoxLine.append(registrationNumber, refuelingDate);


            const secondBoxLine = document.createElement("div");
            secondBoxLine.classList.add("second-box-line");

            const carMileage = document.createElement("span");
            if (checkIfCarMileageAfterEqualsZero) {
                carMileage.innerHTML = "Brak trasy";
            } else {
                carMileage.innerHTML = (refuel.car_mileage_after - refuel.car_mileage) + " km";
            }

            const totalLiters = document.createElement("span");
            totalLiters.innerHTML = "Spalanie nieznane";
            // totalLiters.innerHTML = refuel.liters_after - refuel.liters_before + " L";

            secondBoxLine.append(carMileage, totalLiters);

            const boxAdditionalInfo = document.createElement("div");
            boxAdditionalInfo.classList.add("additional-info");

            for (let i = 0; i < Object.keys(additionalInfoMap).length; i++) {
                let additionalDiv = document.createElement("div");
                additionalDiv.classList.add("additional-div");
                let additionalTitle = document.createElement("span");
                let additionalValue = document.createElement("span");
                additionalTitle.innerHTML = Object.keys(additionalInfoMap)[i];
                additionalValue.innerHTML = additionalInfoMap[Object.keys(additionalInfoMap)[i]];
                additionalDiv.append(additionalTitle, additionalValue);
                boxAdditionalInfo.append(additionalDiv);
            }

            if (checkIfCarMileageAfterEqualsZero) {
                var completeTheMileageDiv = document.createElement("div");
                completeTheMileageDiv.classList.add("complete-the-mileage");

                var completeTheMileageInput = document.createElement("input");
                completeTheMileageInput.classList.add("update-car-mileage");
                completeTheMileageInput.type = "number";
                var completeTheMileageButton = document.createElement("input");
                completeTheMileageButton.type = "button";
                completeTheMileageButton.value = "Uzupełnij przebieg po trasie";
                completeTheMileageButton.classList.add("primary-btn");
                completeTheMileageButton.addEventListener("click", function () {
                    updateCarMileage(refuel.refuel_id, completeTheMileageInput.value)
                });

                completeTheMileageDiv.append(completeTheMileageInput, completeTheMileageButton);

                boxAdditionalInfo.append(completeTheMileageDiv);
            }

            // SPRAWDZANIE CZY JEST JUŻ NASTĘPNE TANKOWANIE DLA DANEGO SAMOCHODU

            // const nextref = await getNextRefuelingReportIfExist(refuel.refuel_id, refuel.registration_id);

            getNextRefuelingReportIfExist(refuel.refuel_id, refuel.registration_id).then(val => {
                if (val != 0 && !checkIfCarMileageAfterEqualsZero) {
                    var fuelConsumptionSpan = secondBoxLine.querySelector("span:nth-of-type(2)");
                    var fuelConsumption = (val / (refuel.car_mileage_after - refuel.car_mileage)) * 100;
                    fuelConsumption = parseFloat(fuelConsumption.toFixed(2));
                    fuelConsumptionSpan.innerHTML = fuelConsumption + "l / 100km"
                    if (fuelConsumption > acceptableFuelConsumption) {
                        fuelConsumptionSpan.innerHTML = fuelConsumptionSpan.innerHTML + " ▲";
                        fuelConsumptionSpan.classList.add("bad-fuel-consumption");
                    } else if (fuelConsumption < acceptableFuelConsumption) {
                        fuelConsumptionSpan.innerHTML = fuelConsumptionSpan.innerHTML + " ▼";
                        fuelConsumptionSpan.classList.add("good-fuel-consumption");
                    }
                }
            });

            div.append(firstBoxLine, secondBoxLine, boxAdditionalInfo);

            // getNextRefuelingReportIfExist(refuel.refuel_id, refuel.registration_id).then(val => {
            //     if (val != 0 && !checkIfCarMileageAfterEqualsZero) {
            //         const thirdLine = document.createElement("div");
            //         var fuelConsumption = (val/(refuel.car_mileage_after - refuel.car_mileage))*100;
            //         fuelConsumption = parseFloat(fuelConsumption.toFixed(2));
            //         thirdLine.innerHTML = "Spalanie: " + fuelConsumption + " L / 100 km";
            //         thirdLine.classList.add("third-box-line");
            //         if(fuelConsumption > acceptableFuelConsumption){
            //             thirdLine.classList.add("bad-fuel-consumption");
            //         } else{
            //             thirdLine.classList.add("good-fuel-consumption");
            //         }
            //         div.append(firstBoxLine, secondBoxLine, thirdLine, boxAdditionalInfo);
            //     } else {
            //         div.append(firstBoxLine, secondBoxLine, boxAdditionalInfo);
            //     }
            // });

            // SPRAWDZANIE CZY JEST JUŻ NASTĘPNE TANKOWANIE DLA DANEGO SAMOCHODU

            container.appendChild(div);
        });

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


    } catch (error) {
        console.error('Błąd:', error);
    }
}