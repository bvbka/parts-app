<?php
    //select status,count(task_id) as 'status_count' from tasks where assignee_alias = "mateuszt" group by status;
    session_start();

    header('Content-Type: application/json');

    if (!isset($_SESSION['user'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Nie jesteś zalogowany']);
        exit;
    }

    $alias = $_SESSION['user'];

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
        http_response_code(500);
        echo json_encode(['error' => 'Błąd połączenia z bazą']);
        exit;
    }

    $sql = "SELECT 
                CASE 
                    WHEN status IN ('new', 'accepted', 'verify') THEN 'open'
                    WHEN status IN ('rejected', 'done') THEN 'closed'
                END AS status_group,
                COUNT(task_id) AS status_count
            FROM tasks
            WHERE assignee_alias = '$alias'
            GROUP BY status_group;
            ";

    $result = mysqli_query($conn, $sql);

    $response = [
        "open" => 0,
        "closed" => 0
    ];

    while ($row = $result->fetch_assoc()) {
        $response[$row['status_group']] = (int)$row['status_count'];
    }

    echo json_encode($response);

    $conn->close();
?>