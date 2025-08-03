window.addEventListener("DOMContentLoaded", async () => {
    const publicLocation = window.location.pathname.split("/public")[0] + "/public";
    const response = await fetch(publicLocation + "/php/check_session.php");
    const result = await response.text();
    if (result.trim() !== "NO_SESSION") {
        console.log("Jesteś poprawnie zalogowany!");
    } else if (!window.location.pathname.endsWith("index.html")) {
        window.location.href = "index.html";
    }
});