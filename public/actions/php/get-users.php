<?php
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

$alias = $_SESSION['user'];

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = mysqli_connect("mysql.railway.internal", "root", "qSGDWJXvdyiyinJdgtkCshVvWOQjqPDz", "railway");
} catch (mysqli_sql_exception $e) {
    try {
        $conn = mysqli_connect("localhost", "root", "", "tasks_app");
    } catch (mysqli_sql_exception $e) {
        http_response_code(500);
        echo json_encode([]);
        exit;
    }
}

$sql = "SELECT name, surname, alias FROM users WHERE alias <> ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $alias);
$stmt->execute();
$result = $stmt->get_result();

$users = [];

while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode($users);
