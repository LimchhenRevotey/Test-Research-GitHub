const roomsContainer = document.getElementById('rooms-container');
const totalRoom = document.getElementById('total-rooms');
const totalCheckIn = document.getElementById('checkIn-rooms');
const totalCheckOut = document.getElementById('checkOut-rooms');

// localStorage data
let allData = JSON.parse(localStorage.getItem('floorsData')) || [];

// Open Check In Modal
const btnCheckIn = document.getElementById('btnCheckIn');
function openCheckIn() {
    document.getElementById('name-guest').value = "";
    document.getElementById('floor-num').value = "";
    document.getElementById('room-num').value = "";

    const modal = new bootstrap.Modal(document.getElementById('checkInModal'));
    modal.show();
}
if (btnCheckIn) {
    btnCheckIn.addEventListener('click', openCheckIn);
}

// Open Check Out Modal
const btnCheckOut = document.getElementById('btnCheckOut');
function openCheckOut() {
    document.getElementById('floor-num').value = "";
    document.getElementById('room-num').value = "";

    const modal = new bootstrap.Modal(document.getElementById('checkOutModal'));
    modal.show();
}
if (btnCheckOut) {
    btnCheckOut.addEventListener('click', openCheckOut);
}

// Comfirm Check In
const confirmCheckInBtn = document.getElementById('confirm-checkin');
function confirmCheckIn() {
    const guestName = document.getElementById('name-guest').value.trim();
    const floorNum = document.getElementById('floor-num').value.trim();
    const roomNum = document.getElementById('room-num').value.trim();

    // Validation
    if (!guestName && !floorNum && !roomNum) {
        alert("Please fill in all required fields!");
        return;
    }
    if (floorNum <= 0) {
        alert("Please enter a valid floor number!");
        return;
    }
    if (roomNum <= 0) {
        alert("Please enter a valid room number!");
        return;
    }
    // Check if floor exists
    const targetFloor = allData.find(floor => floor.name === `Floor ${floorNum}`);
    if (!targetFloor) {
        alert(`Floor ${floorNum} does not exist!`);
        return;
    }
    // Check if room exists on the floor
    let validRooms = [];
    for (let i = 1; i <= targetFloor.rooms; i++) {
        let generatedRoomNum = floorNum + (i < 10 ? "0" + i : "" + i);
        validRooms.push(generatedRoomNum);
    }

    if (!validRooms.includes(roomNum)) {
        alert(`This room ${roomNum} does not exist on Floor ${floorNum}. Please enter a valid room number!`);
        return;
    }

    let bookings = localStorage.getItem('bookingInfo') ? JSON.parse(localStorage.getItem('bookingInfo')) : {};
    if (!bookings[roomNum] || bookings[roomNum].status !== 'checked-in') {
        bookings[roomNum] = {
            guestName,
            floorNum,
            roomNum,
            status: "checked-in"
        };
    } else {
        alert(`Room ${roomNum} is already checked in! Please choose another room!`);
        return;
    }   
    localStorage.setItem('bookingInfo', JSON.stringify(bookings));
    alert(`Successfully checked in ${guestName} to Room ${roomNum} on Floor ${floorNum}!`);
    location.reload();
}
if (confirmCheckInBtn) {
    confirmCheckInBtn.addEventListener('click', confirmCheckIn);
}

// Comfirm Check Out
const confirmCheckOutBtn = document.getElementById('confirm-checkout');
function confirmCheckOut() {
    const floorNum = document.getElementById('co-floor-num').value.trim();
    const roomNum = document.getElementById('co-room-num').value.trim();
    
    if (!floorNum && !roomNum) {
        alert("Please fill in Floor and Room number!");
        return;
    }
    if(floorNum <= 0) {
        alert("Please enter a valid floor number!");
        return;
    }
    if(roomNum <= 0) {
        alert("Please enter a valid room number!");
        return;
    }
    let bookings = localStorage.getItem('bookingInfo') ? JSON.parse(localStorage.getItem('bookingInfo')) : {};
    if(!bookings[roomNum] || bookings[roomNum].floorNum !== floorNum) {
        alert(`Room ${roomNum} on Floor ${floorNum} does not exist! Please enter valid floor and room numbers!`);
        return;
    }
    
    if (!bookings [floorNum] && bookings[roomNum].status === 'checked-in') {
        bookings[roomNum].status = 'checked-out';
        bookings[roomNum].guestName = "";
        localStorage.setItem('bookingInfo', JSON.stringify(bookings));
        alert(`Room ${roomNum} checked out successfully!`);
        location.reload();
    } else {
        alert(`Room ${roomNum} is not currently checked in! Please enter a valid room number!`);
    }
}

if (confirmCheckOutBtn) {
    confirmCheckOutBtn.addEventListener('click', confirmCheckOut);
}

// Show rooms for booking
function showBookingRooms() {
    roomsContainer.innerHTML = "";
    const bookings = JSON.parse(localStorage.getItem('bookingInfo')) || {};
    let totalRooms = 0;

    if (allData.length === 0) {
        roomsContainer.innerHTML = `<div class="text-center py-5 text-muted">No room data available.</div>`;
        return;
    }

    allData.forEach((floor, index) => {
        totalRooms += floor.rooms;
        let roomsHtml = "";
        const floorNumber = floor.name.replace(/\D/g, ""); 
        for (let i = 1; i <= floor.rooms; i++) {
            let roomNum = floorNumber +(i < 10 ? "0" + i : "" + i);
            let isBooked = bookings[roomNum] && bookings[roomNum].status === 'checked-in';
            let bgClass = isBooked ? "bg-danger text-white border-danger" : "bg-white text-dark";
            let guestName = bookings[roomNum]?.guestName;
            let displayGuest = guestName ? guestName : "";
            roomsHtml += `
                <div class="col-auto">
                    <div class="card p-2 text-center shadow-sm ${bgClass}" style="min-width: 70px; border-radius: 10px;">
                        <span class="d-block fw-bold ${isBooked ? 'text-white-50' : 'text-muted'}" >Room</span>
                        <span class="fw-bold">${roomNum}</span>
                        <small>Name: ${displayGuest}</small>
                    </div>
                </div>`;
        }
        const floorSection = `
            <div class="mb-5">
                <h5 class="fw-bold mb-3"><i class="bi bi-layers text-primary me-2"></i>${floor.name}</h5>
                <div class="row g-3">
                    ${roomsHtml}
                </div>
            </div>`;

        roomsContainer.innerHTML += floorSection;
    });

    // Total Rooms
    if (totalRoom) totalRoom.innerText = totalRooms;
    if (totalCheckIn) {
        const count = Object.values(bookings).filter(b => b && b.status === 'checked-in').length;
        totalCheckIn.innerText = count;
    }    
    if (totalCheckOut) {
        const count = Object.values(bookings).filter(b => b && b.status === 'checked-out').length;
        totalCheckOut.innerText = count;
    }    
}

// Clear booking data
const btnClearData = document.getElementById('btnClearData');
function resetData() {
    if (confirm("Are you sure you want to clear all data?")) {
        localStorage.removeItem('floorsData'); 
        localStorage.removeItem('bookingInfo');
        alert("Data cleared!");
        location.href = "../index.html"; 
    }
}

if (btnClearData) {
    btnClearData.addEventListener('click', resetData);
}

// Call the function when the page loads
showBookingRooms();