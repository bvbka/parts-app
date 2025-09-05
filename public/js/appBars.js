document.addEventListener("DOMContentLoaded", function() {
    var optionMarker = document.querySelector(".selected-option");
    var endPoints = document.querySelectorAll(".endpoint-option");

    if (localStorage.getItem('role') == 'admin') {
        var options = document.querySelectorAll(".panel-option");
    } else {
        var options = document.querySelectorAll(".panel-option:not(.admin)");
        var adminOptions = document.querySelectorAll(".admin");
        adminOptions.forEach(adminOption => {
            adminOption.style.display = "none";
        });
    }

    endPoints.forEach(end => {
        end.style.display = "none";
    });

    endPoints[0].style.display = "block";

    optionMarker.style.width = (document.body.clientWidth / options.length) + "px";

    options[0].style.color = "var(--panel-accent-color)";

    // Domyślnie ustaw gradient dla pierwszej opcji:
    if (options.length > 0) {
        options.forEach(option => {
            option.style.color = "rgba(255, 255, 255, 0.3)";
            const g = option.querySelector('g');
            if (g) g.setAttribute('fill', 'currentColor');
        });
        options[0].style.color = 'rgba(255,255,255,0.3)'; // lub inny kolor bazowy widoczny przy gradiencie
        const g0 = options[0].querySelector('g');
        if (g0) g0.setAttribute('fill', 'url(#myGradient)');
        endPoints.forEach(end => (end.style.display = 'none'));
        if (endPoints[0]) endPoints[0].style.display = 'block';
    }

    for (let i = 0; i < options.length; i++) {
        let opt = options[i];
        opt.addEventListener("click", function () {
            optionMarker.style.marginLeft = (parseFloat(optionMarker.style.width) * i) + "px";

            options.forEach(option => {
                option.style.color = "rgba(255, 255, 255, 0.3)";
                const g = option.querySelector('g');
                if (g) g.setAttribute('fill', 'currentColor');
            });

            this.style.color = 'rgba(255,255,255,0.3)'; // albo inny kolor bazowy, by gradient był widoczny
            const g = this.querySelector('g');
            if (g) g.setAttribute('fill', 'url(#myGradient)');

            endPoints.forEach(end => (end.style.display = "none"));
            endPoints[i].style.display = "block";
        });
    }

    const titleBars = document.querySelectorAll('.app-title-bar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            titleBars.forEach(bar => bar.classList.add('scrolled'));
        } else {
            titleBars.forEach(bar => bar.classList.remove('scrolled'));
        }
    });
});