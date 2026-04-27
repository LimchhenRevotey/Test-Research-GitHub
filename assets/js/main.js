// Elements
const floorNameInput = document.getElementById('floor-name');
const floorRoomsInput = document.getElementById('floor-rooms');
const addFloorBtn = document.getElementById('add-floor');
const floorsList = document.getElementById('floors-list');
const todayDateSpan = document.getElementById('today-date');
const roomsBooking = document.getElementById('rooms-booking');
const goBackBtn = document.getElementById('go-back');

// date today
if (todayDateSpan) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todayDateSpan.innerText = new Date().toLocaleDateString('km-KH', options);
}
// go back
if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
        localStorage.removeItem('bookingInfo');
        localStorage.removeItem('floorsData');
        location.href = '../index.html';
    });
}
// go to booking page
if (roomsBooking) {
    roomsBooking.addEventListener('click', () => {
        if (!localStorage.getItem('floorsData')) {
            alert("Please create floors and rooms first!");
            return;
        }
        location.href = 'pages/roomsBooking.html';
    });
}
// Event for adding floor
if (addFloorBtn) {  
    addFloorBtn.addEventListener('click', createFloor);
}

// Create floor
function createFloor() {
    const floorCountValue = parseInt(floorNameInput.value);
    const roomsPerFloor = parseInt(floorRoomsInput.value);
    if ( floorCountValue <= 0) {
        alert("Please enter a valid number of floors!");
        return;
    }
    if ( roomsPerFloor <= 0) {
        alert("Please enter a valid number of rooms per floor!");
        return;
    }
    floorsData = [];  // clear data 

    for (let i = 1; i <= floorCountValue; i++) {
        const newFloor = {
            id: Date.now() + i,
            name: `Floor ${i}`,
            rooms: roomsPerFloor
        };
        floorsData.push(newFloor);
    }
    showFloors();
    alert(`Successfully created ${floorCountValue} floors and ${floorCountValue * roomsPerFloor} rooms!`);
    localStorage.setItem('floorsData', JSON.stringify(floorsData));

    // clear inputs
    floorNameInput.value = "";
    floorRoomsInput.value = "";
}

// Show floors and rooms
function showFloors() {
    floorsList.innerHTML = "";

    if (floorsData.length === 0) {
        floorsList.innerHTML = `<div class="text-center text-muted py-5">
            <p>
                <i class="bi bi-building me-2 text-info"></i>No data available.
            </p>
        </div>`;
        return;
    }
    floorsData.forEach((floor, index) => {
    let roomsHtml = "";
    const floorNumber = floor.name.replace(/\D/g, ""); 
    for (let i = 1; i <= floor.rooms; i++) {
        let roomPart = (i < 10 ? "0" + i : String(i));
        let roomNum = floorNumber + roomPart; 
        roomsHtml += `
            <div class="col-auto">
                <div class="p-2 border rounded-3 bg-light text-center" style="min-width: 65px;">
                    <small class="d-block text-muted" style="font-size: 10px;">Room</small>
                    <span class="fw-bold">${roomNum}</span>
                </div>
            </div>`;
    }
        const floorHtml = `
            <div class="mb-4 p-3 border rounded-4 bg-white shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 class="fw-bold m-0"><i class="bi bi-layers me-2 text-primary"></i>${floor.name}</h6>
                        <span class="badge bg-info text-dark mt-1">${floor.rooms} Rooms</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteFloor(${floor.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="row g-2">
                    ${roomsHtml}
                </div>
            </div>`;
        floorsList.innerHTML += floorHtml;
    });
}

// Function for deleting floor
function deleteFloor(id) {
    const floorToDelete = floorsData.find(f => f.id === id);
    if (!floorToDelete) return;
    if (confirm(`Are you sure you want to delete ${floorToDelete.name} and all its room data?`)) {
        let bookings = JSON.parse(localStorage.getItem('bookingInfo')) || {};
        const floorNumStr = floorToDelete.name.replace(/\D/g, ""); 
        Object.keys(bookings).forEach(roomKey => {
            if (bookings[roomKey].floorNum === floorNumStr) {
                delete bookings[roomKey];
            }
        });
        localStorage.setItem('bookingInfo', JSON.stringify(bookings));
        floorsData = floorsData.filter(floor => floor.id !== id);
        localStorage.setItem('floorsData', JSON.stringify(floorsData));        
        alert("Floor and room data deleted successfully!");
        showFloors();
    }
}