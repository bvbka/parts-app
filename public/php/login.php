<?php
session_start(); // <--- dodaj na początku

ini_set('display_errors', 0);         // wyłącza pokazywanie błędów na ekranie
error_reporting(0);                   // wyłącza raportowanie błędów

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $host = "mysql.railway.internal";
    $user = "root";
    $pass = "qSGDWJXvdyiyinJdgtkCshVvWOQjqPDz";
    $db   = "railway";

    $conn = mysqli_connect($host, $user, $pass, $db);

} catch (mysqli_sql_exception $e) {
    // Próba z lokalnymi danymi (np. XAMPP)
    try {
        $host = "localhost";
        $user = "root";
        $pass = "";
        $db   = "tasks_app";

        $conn = mysqli_connect($host, $user, $pass, $db);

    } catch (mysqli_sql_exception $e) {
        ini_set('display_errors', 1);
        error_reporting(E_ALL);

        die("Błąd połączenia z bazą danych (Railway i XAMPP): " . $e->getMessage());
    }
}

$alias = $_POST['login'] ?? '';
$password = $_POST['password'] ?? '';

if (!$alias || !$password) {
    echo "Brak danych.";
    exit;
}

$alias = mysqli_real_escape_string($conn, $alias);
$password = mysqli_real_escape_string($conn, $password);

$sql = "SELECT * FROM users WHERE alias='$alias' AND password='$password'";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo "Błąd zapytania: " . mysqli_error($conn);
    exit;
}

if (mysqli_num_rows($result) === 1) {
    $_SESSION['user'] = $alias; // <-- zapisz użytkownika
    echo "OK";
} else {
    echo "Błąd";
}

$sql2 = "SELECT * FROM users WHERE alias='$alias'";
$result2 = mysqli_query($conn, $sql2);

if (mysqli_num_rows($result2) === 1) {
    $row = mysqli_fetch_assoc($result2);
    $_SESSION['user_id'] = $row['id']; // zapis ID użytkownika do sesji
    echo "OK";
} else {
    echo "Błąd";
}

mysqli_close($conn);
?>
