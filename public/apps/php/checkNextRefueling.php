<?php
session_start();

header('Content-Type: application/text');

if (!isset($_SESSION['user'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Nie jesteś zalogowany']);
    exit;
}

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
$registration_id = $_POST['registration_id'];

$sql = "SELECT refuel_id, registration_id, (liters_after-liters_before) as 'liters'
        FROM refueling 
        WHERE registration_id = '$registration_id' 
        AND refuel_id > $refuel_id";

$result = mysqli_query($conn, $sql);

$row = mysqli_fetch_assoc($result);

// $value1 = $row['refuel_id'];
// $value2 = $row['registration_id'];
// $value3 = $row['liters'];

// echo $value1." ".$value2." ".$value3." | REJ: ".$registration_id ;

if($row) echo $row['liters'];
else echo "Brak";

$conn->close();

