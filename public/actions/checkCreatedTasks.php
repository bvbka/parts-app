<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta http-equiv="Cache-Control" content="no-store" />
    <script src="../js/popUp.js"></script>
    <title>Create task</title>
    <style>
        body {
            margin: 0;
            width: 100%;
            height: 100vh;
            background-color: #151515;
            font-family: system-ui;
        }

        .task{
            width: calc(100% - 12px);
            height: 50px;
            background-color: white;
            margin-bottom: 10px;
            padding: 6px;
        }
        .task-title{
            width: 100%;
            height: 50%;
            font-weight: bold;
        }
        .task-details{
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>

<body>
    <table>
        <?php
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
                die("Błąd połączenia z bazą: " . mysqli_connect_error());
            }

            $sql = "SELECT summary, status, name, surname FROM tasks JOIN users ON assignee_alias = alias WHERE reporter_alias = '$alias'";
            $result = mysqli_query($conn, $sql);

            $statusMap = [
                "new" => "ℹ️ Nowe"
            ];

            $colorMap = [
                "new" => "#1c6beb"
            ];

            while ($row = mysqli_fetch_assoc($result)) {
                $taskSummary = $row['summary'];
                $taskStatus = $row['status'];
                $taskAssignee = $row['name']." ".$row['surname'];

                $borderTop = "5px solid ".$colorMap['new'];

                echo "<div class='task' style='border-top: $borderTop'>";
                echo "<div class='task-title'>$taskSummary</div>";
                echo "<div class='task-details'>";
                echo "<span class='task-assignee'>$taskAssignee</span>";
                echo "<span class='task-status'>".$statusMap[$taskStatus]."</span>";
                echo "</div>";
                echo "</div>";
            }
        ?>
    </table>
</body>

</html>