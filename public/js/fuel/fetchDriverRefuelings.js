var driverLineChartData = [];
// const acceptableFuelConsumption = 11.5;

async function fetchDriverRefuelings(driver) {
    driverLineChartData = []; // <--- tu
    try {
        const response = await fetch('php/fuel/driverRefuelings.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ driver_alias: driver })
            });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'index.html';
                return [];
            }
            throw new Error('Błąd sieci');
        }

        const refuelings = await response.json();

        async function getNextRefuelingReportIfExist(refuelId, carRegistrationId) {
            const res = await fetch('php/fuel/checkNextRefueling.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ refuel_id: refuelId, registration_id: carRegistrationId })
            });
            if (!res.ok) throw new Error('Błąd sieci');
            const txt = await res.text();
            return txt !== "Brak" ? parseFloat(txt) : 0;
        }

        const promises = refuelings.map(async refuel => {
            
            const checkIfCarMileageAfterEqualsZero = refuel.car_mileage_after == 0;

            // // pobranie spalania
            const next = await getNextRefuelingReportIfExist(refuel.refuel_id, refuel.registration_id);
            if (next !== 0 && !checkIfCarMileageAfterEqualsZero) {
                let fuelConsumption = parseFloat(((next / (refuel.car_mileage_after - refuel.car_mileage)) * 100).toFixed(2));
                driverLineChartData.push([refuel.refueling_date + " " + refuel.refueling_time, fuelConsumption]);
            }

            return [refuel.refueling_date + " " + refuel.refueling_time, next !== 0 && !checkIfCarMileageAfterEqualsZero ? parseFloat(((next / (refuel.car_mileage_after - refuel.car_mileage)) * 100).toFixed(2)) : null];
        });

        const results = await Promise.all(promises);

        return results.filter(r => r[1] !== null);

    } catch (error) {
        console.error('Błąd:', error);
        return [];
    }

}
