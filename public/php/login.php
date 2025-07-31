<?php
session_start(); // <--- dodaj na początku

$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'tasks_app';

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Błąd połączenia z bazą danych: " . mysqli_connect_error());
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

mysqli_close($conn);
?>
