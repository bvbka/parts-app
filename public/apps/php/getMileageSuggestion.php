<?php
session_start();

header('Content-Type: application/text; charset=UTF-8');

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

$registration_name = $_POST['registration'];

$sql = "SELECT MAX(car_mileage_after) 
        FROM refueling 
        JOIN cars 
        ON cars.car_id=refueling.registration_id
        WHERE registration = '$registration_name'";

$result = mysqli_query($conn, $sql);

$row = mysqli_fetch_row($result);

echo $row[0];

$conn->close();
