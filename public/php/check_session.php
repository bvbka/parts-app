<?php
session_start();

if (isset($_SESSION['user'])) {
    echo $_SESSION['user']; // np. "mateuszt"
} else {
    echo "NO_SESSION";
}
?>
