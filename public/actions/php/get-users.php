<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.html");
    exit;
}
$alias = $_SESSION['user'];

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

$sql = "SELECT name, surname FROM users WHERE alias <> ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $alias);
$stmt->execute();
$result = $stmt->get_result();

$users = [];

while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode($users);
