<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.html");
    exit;
}
$alias = $_SESSION['user'];
$userId = $_SESSION['user_id'];

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

//	leave_id	worker_alias	type	start_date	end_date	extras		

$sql = "INSERT INTO leaves (worker_alias, type, start_date, end_date, extras) 
        VALUES ()";

if (mysqli_query($conn, $sql)) {
    echo "OK";
} else {
    http_response_code(500);
    echo "Błąd zapisu: " . mysqli_error($conn);
}

?>