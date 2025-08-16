<?php
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Nie jesteś zalogowany']);
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
    echo json_encode(['error' => 'Błąd połączenia z bazą']);
    exit;
}

$refuel_id = $_POST['refuel_id'];
$new_mileage = $_POST['new_mileage'];

// $sql = "UPDATE tasks SET status = '$newStatus' WHERE task_id = $taskId";
$sql = "UPDATE refueling SET car_mileage_after = $new_mileage WHERE refuel_id = $refuel_id";
if (mysqli_query($conn, $sql)) {
    echo "OK";
} else {
    echo "ERROR";
}

$conn->close();

