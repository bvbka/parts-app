function showPopUp(type="info", title="Pop up!", content="Content") {
    var color = "";
    switch(type) {
        case 'info': color = "blue"; break;
        case 'pass': color = "green"; break;
        case 'warning': color = "yellow"; break;
        case 'error': color = "red"; break;
        default: color = "gray";
    }

    var popUpContainer = document.createElement("div");
    popUpContainer.style.position = "fixed";
    popUpContainer.style.top = 0;
    popUpContainer.style.left = 0;
    popUpContainer.style.width = "100%";
    popUpContainer.style.height = "100vh";
    popUpContainer.style.backgroundColor = "rgba(0,0,0,0.3)";
    popUpContainer.style.display = "flex";
    popUpContainer.style.justifyContent = "center";
    popUpContainer.style.alignItems = "center";
    popUpContainer.style.zIndex = 9999;

    var popUp = document.createElement("div");
    popUp.style.width = "400px";
    popUp.style.minHeight = "150px";
    popUp.style.backgroundColor = "white";
    popUp.style.borderRadius = "8px";
    popUp.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    popUp.style.padding = "20px";
    popUp.style.color = color;
    popUp.style.display = "flex";
    popUp.style.flexDirection = "column";
    popUp.style.gap = "10px";

    var popUpTitle = document.createElement("div");
    popUpTitle.style.fontSize = "24px";
    popUpTitle.style.fontWeight = "bold";
    popUpTitle.textContent = title;

    var popUpContent = document.createElement("div");
    popUpContent.style.flex = "1";
    popUpContent.style.fontSize = "16px";
    popUpContent.innerHTML = content;

    popUp.appendChild(popUpTitle);
    popUp.appendChild(popUpContent);
    popUpContainer.appendChild(popUp);

    popUpContainer.addEventListener('click', function(e) {
        if(e.target === popUpContainer) {
            document.body.removeChild(popUpContainer);
        }
    });

    document.body.appendChild(popUpContainer);
}
