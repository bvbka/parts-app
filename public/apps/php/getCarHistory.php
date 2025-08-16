<?php
session_start();

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nie jesteś zalogowany'], JSON_UNESCAPED_UNICODE);
    exit;
}

$alias = $_SESSION['user'];

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$isProd = ($_SERVER['HTTP_HOST'] === 'parts-app-production-1abc.up.railway.app');

if ($isProd) {
    $host = "mysql.railway.internal";
    $user = "root";
    $pass = "qSGDWJXvdyiyinJdgtkCshVvWOQjqPDz";
    $db   = "railway";
} else {
    $host = "localhost";
    $user = "root";
    $pass = "";
    $db   = "tasks_app";
}

$conn = mysqli_connect($host, $user, $pass, $db);
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Błąd połączenia z bazą'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Tu wybieramy konkretne kolumny w takiej kolejności,
// żeby od razu utworzyć tablicę 2D (bez kluczy asocjacyjnych)
$sql = "SELECT name,registration,(liters_after-liters_before),car_mileage 
        FROM refueling 
        JOIN users ON users.alias=refueling.driver_alias 
        JOIN cars ON cars.car_id=refueling.registration_id 
        WHERE registration_id = 3";

$result = mysqli_query($conn, $sql);

$history = [];
while ($row = mysqli_fetch_row($result)) { // mysqli_fetch_row daje tablicę numeryczną
    $history[] = $row; // każdy wiersz to podtablica [data, opis, kwota]
}

echo json_encode($history, JSON_UNESCAPED_UNICODE);

$conn->close();
