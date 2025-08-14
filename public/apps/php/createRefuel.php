<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.html");
    exit;
}
$alias = $_SESSION['user'];
$userId = $_SESSION['user_id'];

ini_set('display_errors', 0);         // wyłącza pokazywanie błędów na ekranie
error_reporting(0);                   // wyłącza raportowanie błędów

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
    die("Błąd połączenia z bazą: " . mysqli_connect_error());
}

$registration = $_POST["registration"] ?? '';
$liters_before = $_POST["liters_before"] ?? '';
$liters_after = $_POST["liters_after"] ?? '';
$car_mileage = $_POST["car_mileage"] ?? '';
 
if (!$registration || !$liters_before || !$liters_after || !$car_mileage) {
    http_response_code(400);
    echo "Brakuje danych";
    exit;
}

$result = mysqli_query($conn, "SELECT MAX(refuel_id) AS max_id FROM refueling");
$row = mysqli_fetch_assoc($result);
$next_id = $row['max_id'] + 1;

$result = mysqli_query($conn, "SELECT car_id FROM cars WHERE registration = '$registration'");
$row = mysqli_fetch_assoc($result);
$registration_id = $row['car_id'];

//	refuel_id	driver_alias	registration_id	liters_before	liters_after	car_mileage	    refueling_date  refueling_time

$sql = "INSERT INTO refueling 
        (refuel_id, driver_alias, registration_id, liters_before, liters_after, car_mileage, refueling_date, refueling_time) 
        VALUES 
        ($next_id, '$alias', '$registration_id', $liters_before, $liters_after, $car_mileage, CURDATE(), DATE_FORMAT(NOW(), '%H:%i:%s'))";


if (mysqli_query($conn, $sql)) {
    echo "OK";
} else {
    http_response_code(500);
    echo "Błąd zapisu: " . mysqli_error($conn);
}

?>