<?php
//$host = 'localhost';
//$user = 'root';
//$pass = '';
//$db   = 'tasks_app';

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
        $host = "127.0.0.1";
        $user = "root";
        $pass = "";
        $db   = "railway"; // lub "test"

        $conn = mysqli_connect($host, $user, $pass, $db);

    } catch (mysqli_sql_exception $e) {
        die("Błąd połączenia z bazą danych (Railway i XAMPP): " . $e->getMessage());
    }
}

$sql = "SELECT * FROM users";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "ID: " . $row['user_id'] . "<br>";
        echo "Alias: " . $row['alias'] . "<br>";
        echo "Hasło: " . $row['password'] . "<br>";
        echo "Imię: " . $row['name'] . "<br>";
        echo "Nazwisko: " . $row['surname'] . "<br>";
        echo "<hr>";
    }
} else {
    echo "Brak użytkowników w bazie.";
}



?>
