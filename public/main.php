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

$sql = "SELECT name, surname FROM users WHERE alias='$alias'";
$result = mysqli_query($conn, $sql);

if ($row = mysqli_fetch_assoc($result)) {
    $name = htmlspecialchars($row['name']);
    $surname = htmlspecialchars($row['surname']);
} else {
    $name = "Nieznany";
    $surname = "";
}

mysqli_close($conn);

?>
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Main</title>
  <style>
    :root{
        --welcome-height: 100px;
    }
    body {
        background-color: #151515;
        margin: 0;
        width: 100%;
        height: 100vh;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .options {
        width: 100%;
        height: calc(100% - var(--welcome-height));
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .option {
        background-color: transparent;
        width: 80%;
        height: 70px;
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 25px;
        font-weight: bold;
        border-radius: 25px;
        border: 2px solid white;
        transition: all 0.2s ease-in-out;
        text-align: center;
        color: white;
        box-shadow: 0 0 16px 2px rgba(20, 103, 220, 0.8),0 0 16px 2px rgba(20, 103, 220, 0.8) inset;
    }
    .option:hover{
        background-color: rgba(20, 103, 220);
        color: white;
    }
    .welcome {
        width: 100%;
        height: var(--welcome-height);
        background-color: #252525;
        font-size: 35px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
    }
  </style>
</head>
<body>
    <div class="welcome">Witaj, <?= $name ?>!</div>
    <div class="options">
        <div class="option">Zleć zadanie</div>
        <div class="option">Zlecone zadania</div>
        <div class="option">Twoje aktywne zadania</div>
        <div class="option">Twoje zakmnięte zadania</div>
        <div class="option">Opcje</div>
    </div>
</body>
</html>
