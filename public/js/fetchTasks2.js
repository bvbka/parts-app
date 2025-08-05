async function fetchTasks2(siteType, containerType) {

    var titleBar = document.querySelector(".tasks-title-bar-" + containerType);
    console.log(siteType);
    if (siteType == "checkYourTasks") {
        titleBar.innerHTML = "Do zrobienia";
        console.log("a");
    } else if (siteType == "checkCreatedTasks") {
        titleBar.innerHTML = "Zlecone zadania";
        console.log("b");
    }

    try {
        if (siteType == "checkYourTasks") {
            var response = await fetch('actions/php/yourTasks.php');
        } else if (siteType == "checkCreatedTasks") {
            var response = await fetch('actions/php/tasks_data.php');
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
        const container = document.querySelector('.tasksContainer-' + containerType);
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
                const response = await fetch('actions/php/changeTaskStatus.php', {
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

        tasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'task';
            div.style.borderTop = `7px solid ${colorMap[task.status] || '#ccc'}`;

            // Tytuł zadania
            const titleDiv = document.createElement('div');
            titleDiv.className = 'task-title';
            titleDiv.textContent = "(#" + task.task_id + ") " + task.summary;

            // Czas utworzenia i deadline
            const timesDiv = document.createElement('div');
            timesDiv.className = 'task-times';

            const creation = document.createElement('span');
            const deadline = document.createElement('span');
            creation.innerHTML = "<b>📅 Zlecono:</b> <span>" + formatDateToPolish(task.creation_date) + ", " + cutSeconds(task.creation_time) + "</span>";

            timesDiv.appendChild(creation);

            if (task.deadline_date != undefined && task.deadline_time != undefined) {
                deadline.innerHTML = "<b>⏳ Termin:</b><span>" + formatDateToPolish(task.deadline_date) + ", " + cutSeconds(task.deadline_time) + "</span>";
                timesDiv.appendChild(deadline);
            } else {
                deadline.innerHTML = "<b>⏳ Termin:</b><span>Brak terminu</span>";
                timesDiv.appendChild(deadline);
            }


            // Szczegóły zadania
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'task-details';
            // Przypisany
            const assigneeSpan = document.createElement('span');
            assigneeSpan.textContent = '👤 ' + task.name + ' ' + task.surname;
            // Status
            const statusSpan = document.createElement('span');
            statusSpan.innerHTML = "<b>" + statusMap[task.status] + "</b>" || task.status;


            // Przyciski akcji
            if ((task.status == "new" && siteType == "checkYourTasks") || (task.status == "accepted" && siteType == "checkYourTasks") || (task.status == "verify" && siteType == "checkCreatedTasks")) {
                var buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add("task-buttons");

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
                            fetchTasks();
                        } else {
                            alert("Nie udało się zmienić statusu.");
                        }
                    };
                    secBtn.onclick = async () => {
                        const newStatus = secBtn.getAttribute("to-status");
                        const success = await changeTaskStatus(task.task_id, newStatus);
                        if (success) {
                            // alert("Status zmieniony!");
                            fetchTasks();
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
                            fetchTasks();
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
                            fetchTasks();
                        } else {
                            alert("Nie udało się zmienić statusu.");
                        }
                    };
                    secBtn.onclick = async () => {
                        const newStatus = secBtn.getAttribute("to-status");
                        const success = await changeTaskStatus(task.task_id, newStatus);
                        if (success) {
                            // alert("Status zmieniony!");
                            fetchTasks();
                        } else {
                            alert("Nie udało się zmienić statusu.");
                        }
                    };

                    buttonsDiv.append(primBtn, secBtn);


                }

            }


            // Podpinanie elementów HTML
            detailsDiv.appendChild(assigneeSpan);
            detailsDiv.appendChild(statusSpan);

            div.appendChild(titleDiv);
            div.appendChild(document.createElement("hr"));
            div.appendChild(timesDiv);
            div.appendChild(document.createElement("hr"));
            div.appendChild(detailsDiv);
            if ((task.status == "new" && siteType == "checkYourTasks") || (task.status == "accepted" && siteType == "checkYourTasks") || (task.status == "verify" && siteType == "checkCreatedTasks")) {
                div.appendChild(buttonsDiv);
            }

            container.appendChild(div);
        });

        document.querySelectorAll('.task').forEach(task => {
            task.addEventListener('click', function () {
                let buttonDiv = task.lastChild;
                if (buttonDiv.classList.contains("task-buttons")) {
                    buttonDiv.style.display = (buttonDiv.style.display === "flex") ? "none" : "flex";
                }
            });
        });


    } catch (error) {
        console.error('Błąd:', error);
    }
}