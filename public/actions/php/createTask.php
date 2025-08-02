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

$name_and_surname = $_POST["name_and_surname"] ?? '';
$task_content = $_POST["task_content"] ?? '';

if (!$name_and_surname || !$task_content) {
    http_response_code(400);
    echo "Brakuje danych";
    exit;
}

$result = mysqli_query($conn, "SELECT MAX(task_id) AS max_id FROM tasks");
$row = mysqli_fetch_assoc($result);
$next_id = $row['max_id'] + 1;

$result = mysqli_query($conn, "SELECT alias FROM users WHERE CONCAT(name, ' ', surname) = '$name_and_surname'");
$row = mysqli_fetch_assoc($result);
$assignee = $row['alias'];

//	task_id	reporter_alias	assignee_alias	summary	

$sql = "INSERT INTO tasks (task_id, reporter_alias, assignee_alias, summary, status) VALUES ($next_id, '$alias', '$assignee', '$task_content', 'new')";

if (mysqli_query($conn, $sql)) {
    echo "OK";
} else {
    http_response_code(500);
    echo "Błąd zapisu: " . mysqli_error($conn);
}

?>