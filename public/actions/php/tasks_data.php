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

$sql = "SELECT task_id, summary, status, name, surname, creation_date, creation_time
        FROM tasks
        JOIN users ON assignee_alias = alias
        WHERE reporter_alias = '$alias'
        ORDER BY creation_date DESC, creation_time DESC";


$result = mysqli_query($conn, $sql);

$tasks = [];
while ($row = mysqli_fetch_assoc($result)) {
    $tasks[] = $row;
}

echo json_encode($tasks);

$conn->close();

