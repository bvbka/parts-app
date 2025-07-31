<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.html");
    exit;
}
$alias = $_SESSION['user'];

$host = "mysql.railway.internal";
$user = "root";
$pass = "qSGDWJXvdyiyinJdgtkCshVvWOQjqPDz";
$db   = "railway";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Błąd połączenia z bazą danych: " . mysqli_connect_error());
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
  <title>Main</title>
  <style>
    :root{
        --welcome-height: 100px;
    }
    body {
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
        background-color: rgb(125, 8, 214);
        width: 80%;
        height: 200px;
        margin-top: 40px;
        display: grid;
        place-items: center;
        font-size: 70px;
        font-weight: bold;
        border-radius: 25px;
        transition: all 0.2s ease-in-out;
    }
    .option:hover{
        background-color: crimson;
        color: white;
    }
    .welcome {
      width: 100%;
      height: var(--welcome-height);
      background-color: lightblue;
      font-size: 50px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
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
