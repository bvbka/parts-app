<?php
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nie zalogowany']);
    exit;
}

$alias = $_SESSION['user'];

try {
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


    $stmt = $conn->prepare("SELECT name, surname FROM users WHERE alias = ?");
    $stmt->bind_param('s', $alias);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'name' => $row['name'],
            'surname' => $row['surname']
        ]);
    } else {
        echo json_encode([
            'name' => 'Nieznany',
            'surname' => ''
        ]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
