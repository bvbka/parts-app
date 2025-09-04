<?php
session_start(); // <--- dodaj na początku

header('Content-Type: application/json');

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

$alias = $_POST['login'] ?? '';
$password = $_POST['password'] ?? '';

if (!$alias || !$password) {
    echo "Brak danych.";
    exit;
}

$role = 0;

$sql = "SELECT * FROM users WHERE alias='$alias' AND password='$password'";
$result = mysqli_query($conn, $sql);

$sql2 = "SELECT * FROM users WHERE alias='$alias'";
$result2 = mysqli_query($conn, $sql2);


if (!$result) {
    echo "Błąd zapytania: " . mysqli_error($conn);
    exit;
}

if (mysqli_num_rows($result) === 1) {
    $_SESSION['user'] = $alias; // <-- zapisz użytkownika

    $sql = "SELECT role_name 
        FROM users 
        JOIN roles 
        ON roles.role_id=users.role
        WHERE alias = '$alias'";

    $result3 = mysqli_query($conn, $sql);

    $row = mysqli_fetch_assoc($result3);

    $role = $row['role_name'];
    
    $row = mysqli_fetch_assoc($result2);
    $_SESSION['user_id'] = $row['id']; // zapis ID użytkownika do sesji

    echo json_encode([
        'response' => "OK",
        'alias' => $alias,
        'role' => $role
    ]);
} else {
    echo json_encode("Błąd");
}

mysqli_close($conn);
?>
