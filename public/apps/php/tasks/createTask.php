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

$name_and_surname = $_POST["name_and_surname"] ?? '';
$task_content = $_POST["task_content"] ?? '';
$task_deadline_date = $_POST["deadline_date"] ?? '';
$task_deadline_time = $_POST["deadline_time"] ?? '';
$task_priority = $_POST["priority"] ?? '0';

if (!$name_and_surname) {
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

$uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/tasks_audios/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['audio']) && $_FILES['audio']['error'] === UPLOAD_ERR_OK) {
    $tmpName = $_FILES['audio']['tmp_name'];
    $fileName = "task_" . $next_id . ".mp3";
    $dest = $uploadDir . $fileName;

    if (move_uploaded_file($tmpName, $dest)) {
        $task_content = "/tasks_audios/" . $fileName;
    } else {
        http_response_code(500);
        echo "Błąd przy zapisie pliku audio";
        exit;
    }
}

$sql = "INSERT INTO tasks (task_id, reporter_alias, assignee_alias, summary, status, creation_date, creation_time, deadline_date, deadline_time, priority) 
        VALUES ($next_id, '$alias', '$assignee', '$task_content', 'new', CURDATE(), DATE_FORMAT(NOW(), '%H:%i:%s'), '$task_deadline_date', '$task_deadline_time', $task_priority)";

if (mysqli_query($conn, $sql)) {
    echo "OK";
} else {
    http_response_code(500);
    echo "Błąd zapisu: " . mysqli_error($conn);
}


?>