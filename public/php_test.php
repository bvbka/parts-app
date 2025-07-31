<?php
//$host = 'localhost';
//$user = 'root';
//$pass = '';
//$db   = 'tasks_app';

$host = "mysql.railway.internal";
$user = "root";
$pass = "qSGDWJXvdyiyinJdgtkCshVvWOQjqPDz";
$db   = "railway";

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Błąd połączenia z bazą danych: " . mysqli_connect_error());
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
