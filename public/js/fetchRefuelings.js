async function fetchRefuelings() {
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
            console.log(refuel);
            const div = document.createElement('div');
            div.className = 'box';

            var additionalInfoMap = {
                "Litry przed tankowaniem:": refuel.liters_before,
                "Litry po tankowaniu:": refuel.liters_after
            }

            const firstBoxLine = document.createElement("div");
            firstBoxLine.classList.add("first-box-line");

            const registrationNumber = document.createElement("span");
            // var registration = "";
            async function getRegistration() {
                try {
                    const carId = refuel.registration_id; // zakładam, że masz to w obiekcie refuel

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
                    console.log("Registration:", registration);

                    registrationNumber.innerHTML = registration;

                } catch (error) {
                    console.error("Wystąpił błąd:", error);
                }
            }

            // Wywołanie
            getRegistration();
            registrationNumber.style.fontWeight = "bold";

            const totalLiters = document.createElement("span");
            totalLiters.innerHTML = refuel.liters_after - refuel.liters_before + " L";

            firstBoxLine.append(registrationNumber, totalLiters);


            const secondBoxLine = document.createElement("div");
            secondBoxLine.classList.add("second-box-line");

            const carMileage = document.createElement("span");
            carMileage.innerHTML = refuel.car_mileage + " km";
            const carMileage2 = document.createElement("span");
            carMileage2.innerHTML = formatDateToPolish(refuel.refueling_date) + " " + cutSeconds(refuel.refueling_time);

            secondBoxLine.append(carMileage, carMileage2);

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

            div.append(firstBoxLine, secondBoxLine, boxAdditionalInfo);

            container.appendChild(div);
        });

        document.querySelectorAll('.appContainer .box').forEach(box => {
            box.addEventListener('click', function () {
                let additionalInfo = box.querySelector(".additional-info");
                additionalInfo.style.display = (additionalInfo.style.display === "flex") ? "none" : "flex";
            });
        });


    } catch (error) {
        console.error('Błąd:', error);
    }
}