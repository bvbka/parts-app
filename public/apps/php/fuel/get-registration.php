<?php
session_start();

header('Content-Type: text/plain; charset=utf-8');

if (!isset($_POST['car_id'])) {
    http_response_code(400);
    echo "Brak parametru car_id";
    exit;
}

if (!isset($_SESSION['user'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Nie jesteś zalogowany']);
    exit;
}

$car_id = $_POST['car_id'];

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

$sql = "SELECT registration FROM cars WHERE car_id = '$car_id'";



$result = mysqli_query($conn, $sql);

$car = '';
while ($row = mysqli_fetch_assoc($result)) {
    $car = $row['registration'];
}

echo $car;

$conn->close();
?>
