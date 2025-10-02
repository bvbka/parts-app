async function fetchTasks2(siteType, containerType) {

    try {
        var response;
        if (siteType == "checkYourTasks") {
            response = await fetch('php/tasks/yourTasks.php');
        } else if (siteType == "checkCreatedTasks") {
            response = await fetch('php/tasks/tasks_data.php');
        }
        if (!response.ok) {
            if (response.status === 401) {
                // Jeśli nie jest zalogowany, przekieruj
                window.location.href = 'index.html';
                return;
            }
            throw new Error('Błąd sieci');
        }
        const tasks = await response.json();
        const container = document.querySelector('.appContainer-' + containerType);
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

        async function changeTaskStatus(taskId, newStatus) {
            try {
                const response = await fetch('php/tasks/changeTaskStatus.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ task_id: taskId, new_status: newStatus })
                });

                const text = await response.text();

                if (text.trim() === 'OK') {
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

        const showMoreTasks = document.createElement("details");
        const showMoreTasksSummary = document.createElement("summary");

        if (siteType == "checkCreatedTasks") {
            showMoreTasksSummary.innerHTML = "Pokaż zadania w toku / zakończone";
        } else {
            showMoreTasksSummary.innerHTML = "Pokaż zrealizowane / odrzucone zadania";
        }

        showMoreTasks.appendChild(showMoreTasksSummary);
        var countOtherTasks = 0;

        tasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'box';

            let summary = task.summary;
            let status = task.status;
            let assignee = task.name + ' ' + task.surname[0] + '.';
            let deadline = "";

            if (task.deadline_date != "0000-00-00") {
                deadline = formatDateToPolish(task.deadline_date) + ", " + cutSeconds(task.deadline_time);
            } else deadline = "Brak terminu";

            if (siteType == "checkYourTasks") {
                var additionalInfoMap = {
                    "ID zadania:": task.task_id,
                    "Data utworzenia:": formatDateToPolish(task.creation_date) + ", " + cutSeconds(task.creation_time),
                    "Termin:": deadline,
                    "Zleceniodawca": assignee
                }
            } else if (siteType == "checkCreatedTasks") { // OK
                var additionalInfoMap = {
                    "ID zadania:": task.task_id,
                    "Data utworzenia:": formatDateToPolish(task.creation_date) + ", " + cutSeconds(task.creation_time),
                    "Termin:": deadline,
                    "Zleceniobiorca": assignee
                }
            }

            // var additionalInfoMap = {
            //     "ID zadania:": task.task_id,
            //     "Data utworzenia:": formatDateToPolish(task.creation_date) + ", " + cutSeconds(task.creation_time),
            //     "Termin:": deadline,
            //     "Osoba zlecająca": task.reporter_alias,
            //     "Osoba przypisana": assignee
            // }

            const firstTaskLine = document.createElement("div");
            firstTaskLine.classList.add("first-box-line");

            const taskAssignee = document.createElement("span");
            taskAssignee.innerHTML = assignee;
            taskAssignee.style.fontWeight = "bold";
            taskAssignee.style.display = "flex";
            taskAssignee.style.justifyContent = "center";
            taskAssignee.style.alignItems = "center";

            const taskStatus = document.createElement("span");
            taskStatus.classList.add("status-span");
            taskStatus.style.backgroundColor = colorMap[status];
            taskStatus.innerHTML = statusMap[status];
            taskStatus.style.boxShadow = "0 0 10px 0 " + colorMap[status];

            firstTaskLine.append(taskAssignee, taskStatus);


            const secondTaskLine = document.createElement("div");
            secondTaskLine.classList.add("second-box-line");

            const taskSummary = document.createElement("span");
            if (summary.includes("tasks_audios")) {
                console.log(task);
                const audioSummary = document.createElement("audio");
                audioSummary.src = summary;
                audioSummary.controls = "true";
                taskSummary.append(audioSummary);
            } else {
                taskSummary.innerHTML = summary;
            }

            secondTaskLine.append(taskSummary);

            const taskAdditionalInfo = document.createElement("div");
            taskAdditionalInfo.classList.add("additional-info");

            for (let i = 0; i < Object.keys(additionalInfoMap).length; i++) {
                let additionalDiv = document.createElement("div");
                additionalDiv.classList.add("additional-div");
                let additionalTitle = document.createElement("span");
                let additionalValue = document.createElement("span");
                additionalTitle.innerHTML = Object.keys(additionalInfoMap)[i];
                additionalValue.innerHTML = additionalInfoMap[Object.keys(additionalInfoMap)[i]];
                additionalDiv.append(additionalTitle, additionalValue);
                taskAdditionalInfo.append(additionalDiv);
            }

            if (task.priority == 1) {
                const priorityLine = document.createElement("div");
                priorityLine.classList.add("priority-line");
                priorityLine.innerHTML = "PRIORYTET";
                firstTaskLine.style.marginTop = "16px";
                div.append(priorityLine, firstTaskLine, secondTaskLine, taskAdditionalInfo);
            } else {
                div.append(firstTaskLine, secondTaskLine, taskAdditionalInfo);
            }

            // Przyciski akcji
            if ((task.status == "new" && siteType == "checkYourTasks") || (task.status == "accepted" && siteType == "checkYourTasks") || (task.status == "verify" && siteType == "checkCreatedTasks")) {
                var buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add("box-buttons");

                if (task.status == "new" && siteType == "checkYourTasks") {
                    var primBtn = document.createElement("input");
                    primBtn.type = "button";
                    primBtn.value = "Przyjmij";
                    primBtn.style.backgroundColor = colorMap[task.status];
                    primBtn.setAttribute("to-status", "accepted");
                    primBtn.classList.add("primary-btn");
                    var secBtn = document.createElement("input");
                    secBtn.type = "button";
                    secBtn.value = "Odrzuć";
                    secBtn.setAttribute("to-status", "rejected");
                    secBtn.classList.add("secondary-btn");

                    primBtn.onclick = async () => {
                        const newStatus = primBtn.getAttribute("to-status");
                        const success = await changeTaskStatus(task.task_id, newStatus);
                        if (success) {
                            // alert("Status zmieniony!");
                            fetchTasks2(siteType, containerType);
                        } else {
                            alert("Nie udało się zmienić statusu.");
                        }
                    };
                    secBtn.onclick = async () => {
                        const newStatus = secBtn.getAttribute("to-status");
                        const success = await changeTaskStatus(task.task_id, newStatus);
                        if (success) {
                            // alert("Status zmieniony!");
                            fetchTasks2(siteType, containerType);
                        } else {
                            alert("Nie udało się zmienić statusu.");
                        }
                    };

                    buttonsDiv.append(primBtn, secBtn);


                } else if (task.status == "accepted" && siteType == "checkYourTasks") {
                    var primBtn = document.createElement("input");
                    primBtn.type = "button";
                    primBtn.value = "Prześlij do weryfikacji";
                    primBtn.style.backgroundColor = colorMap[task.status];
                    primBtn.setAttribute("to-status", "verify");
                    primBtn.classList.add("primary-btn");

                    primBtn.onclick = async () => {
                        const newStatus = primBtn.getAttribute("to-status");
                        const success = await changeTaskStatus(task.task_id, newStatus);
                        if (success) {
                            // alert("Status zmieniony!");
                            fetchTasks2(siteType, containerType);
                        } else {
                            alert("Nie udało się zmienić statusu.");
                        }
                    };


                    buttonsDiv.append(primBtn);

                } else if (task.status == "verify" && siteType == "checkCreatedTasks") {
                    var primBtn = document.createElement("input");
                    primBtn.type = "button";
                    primBtn.value = "Akceptuj";
                    primBtn.style.backgroundColor = colorMap[task.status];
                    primBtn.setAttribute("to-status", "done");
                    primBtn.classList.add("primary-btn");
                    var secBtn = document.createElement("input");
                    secBtn.type = "button";
                    secBtn.value = "Odrzuć";
                    secBtn.setAttribute("to-status", "accepted");
                    secBtn.classList.add("secondary-btn");

                    primBtn.onclick = async () => {
                        const newStatus = primBtn.getAttribute("to-status");
                        const success = await changeTaskStatus(task.task_id, newStatus);
                        if (success) {
                            // alert("Status zmieniony!");
                            fetchTasks2(siteType, containerType);
                        } else {
                            alert("Nie udało się zmienić statusu.");
                        }
                    };
                    secBtn.onclick = async () => {
                        const newStatus = secBtn.getAttribute("to-status");
                        const success = await changeTaskStatus(task.task_id, newStatus);
                        if (success) {
                            // alert("Status zmieniony!");
                            fetchTasks2(siteType, containerType);
                        } else {
                            alert("Nie udało się zmienić statusu.");
                        }
                    };

                    buttonsDiv.append(primBtn, secBtn);
                }

            }

            if ((task.status == "new" && siteType == "checkYourTasks") || (task.status == "accepted" && siteType == "checkYourTasks") || (task.status == "verify" && siteType == "checkCreatedTasks")) {
                div.appendChild(buttonsDiv);
            }

            if (siteType == "checkCreatedTasks" && (status == "verify" || status == "rejected")) {
                container.appendChild(div);
            } else if (siteType == "checkYourTasks" && (status == "new" || status == "accepted")) {
                container.appendChild(div);
            } else {
                countOtherTasks++;
                showMoreTasks.appendChild(div);
            }
        });

        if (countOtherTasks != 0) {
            container.appendChild(showMoreTasks);
        }

        document.querySelectorAll('.appContainer-' + containerType + ' .box').forEach(task => {
            task.addEventListener('click', function () {
                let buttonDiv = task.lastChild;
                if (buttonDiv.classList.contains("box-buttons")) {
                    buttonDiv.style.display = (buttonDiv.style.display === "flex") ? "none" : "flex";
                }
                let additionalInfo = task.querySelector(".additional-info");
                additionalInfo.style.display = (additionalInfo.style.display === "flex") ? "none" : "flex";

                let secondTaskLine = task.querySelector(".second-box-line");
                secondTaskLine.style.webkitLineClamp = (secondTaskLine.style.webkitLineClamp === "1000") ? "1" : "1000";
            });
        });


    } catch (error) {
        console.error('Błąd:', error);
    }
}