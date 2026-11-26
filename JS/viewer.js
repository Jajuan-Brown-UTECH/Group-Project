document.addEventListener("DOMContentLoaded", () => {
   
    loadViewerLedger();

    //Event Listeners
    document.getElementById("searchInput").addEventListener("keyup", filterLedger);
    document.getElementById("statusFilter").addEventListener("change", filterLedger);
    document.getElementById("printBtn").addEventListener("click", () => window.print());
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
});


function loadViewerLedger() {
    // Retrieve data from localStorage (read-only)
    let students = JSON.parse(localStorage.getItem("students")) || [];
    let payments = JSON.parse(localStorage.getItem("payments")) || [];
    let tableBody = document.getElementById("ledgerBody");
    
    tableBody.innerHTML = "";

    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No financial records available.</td></tr>`;
        return;
    }

    students.forEach(student => {
        // Calculate total paid
        let studentPayments = payments.filter(p => p.studentId === student.id);
        let totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let tuition = student.tuitionFee || 50000; 
        let balance = tuition - totalPaid;
        
        let status = "Outstanding";
        if (balance <= 0) {
            status = "Paid";
        } else if (totalPaid > 0) {
            status = "Pending";
        }

       
        let rowHTML = `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>$${tuition.toFixed(2)}</td>
                <td>$${totalPaid.toFixed(2)}</td>
                <td>$${balance.toFixed(2)}</td>
                <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            </tr>
        `;
        tableBody.innerHTML += rowHTML;
    });
}

//SEARCH AND FILTER 

function filterLedger() {
    let search = document.getElementById("searchInput").value.toLowerCase();
    let statusFilter = document.getElementById("statusFilter").value;
    
    let rows = document.getElementById("ledgerBody").getElementsByTagName("tr");

    for (let row of rows) {
        // Skip empty state row
        if (row.cells.length < 6) continue;

        let id = row.cells[0].innerText.toLowerCase();
        let name = row.cells[1].innerText.toLowerCase();
        let status = row.cells[5].innerText;

        let matchesSearch = id.includes(search) || name.includes(search);
        let matchesStatus = (statusFilter === "All" || status === statusFilter);

        if (matchesSearch && matchesStatus) {
            row.style.display = ""; 
        } else {
            row.style.display = "none"; 
        }
    }
}

// ==========================================
// 4. SESSION & LOGOUT
// ==========================================
function handleLogout() {
    sessionStorage.removeItem("currentUserRole");
    sessionStorage.removeItem("currentUser");
    window.location.href = "../login.html";
}
