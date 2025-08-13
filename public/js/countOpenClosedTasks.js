const openClosedMap = { open: 0, closed: 0 };

async function countOpenClosedTasks() {
    const response = await fetch("../apps/php/openClosedCount.php");
    const data = await response.json(); // data = { open: 9, closed: 3 }

    // nadpisujemy wartości w naszej mapie
    openClosedMap.open = parseInt(data.open, 10) || 0;
    openClosedMap.closed = parseInt(data.closed, 10) || 0;

    return openClosedMap;
}
