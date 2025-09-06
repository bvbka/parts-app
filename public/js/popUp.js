function showPopUp(type = "info", title = "Pop up!", content = "Content") {
    var color = ""; 
    switch (type) { 
        case 'info': color = "blue"; break; 
        case 'pass': color = "green"; break; 
        case 'warning': color = "yellow"; break; 
        case 'error': color = "red"; break; 
        default: color = "gray"; 
    }

    var popUpContainer = document.createElement("div");
    popUpContainer.className = "popUpContainer";

    var popUp = document.createElement("div");
    popUp.className = "popUp " + (["info", "pass", "warning", "error"].includes(type) ? type : "default");

    var popUpTitle = document.createElement("div");
    popUpTitle.className = "popUpTitle";
    popUpTitle.textContent = title;
    popUpTitle.style.backgroundColor = color;

    var popUpContent = document.createElement("div");
    popUpContent.className = "popUpContent";
    popUpContent.innerHTML = content;

    popUp.appendChild(popUpTitle);
    popUp.appendChild(popUpContent);
    popUpContainer.appendChild(popUp);

    popUpContainer.addEventListener("click", function (e) {
        if (e.target === popUpContainer) {
            document.body.removeChild(popUpContainer);
        }
    });

    document.body.appendChild(popUpContainer);
}
