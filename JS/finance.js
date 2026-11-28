document.addEventListener("DOMContentLoaded", () => {
    
   
    // This only runs if "students" doesn't exist in LocalStorage yet.
    if (!localStorage.getItem("students")) {
        localStorage.setItem("students", JSON.stringify([
            { id: "STU001", name: "Alice Smith", tuitionFee: 5000 },
            { id: "STU002", name: "Bob Jones", tuitionFee: 4500 },
            { id: "STU003", name: "Charlie Brown", tuitionFee: 6000 }
        ]));
        localStorage.setItem("payments", JSON.stringify([
            { paymentId: "PAY001", studentId: "STU001", amount: 2000 }
        ]));
    }
    
    loadLedger();

    //  Event Listeners to HTML Elements
    document.getElementById("searchInput").addEventListener("keyup", filterLedger);
    document.getElementById("statusFilter").addEventListener("change", filterLedger);
    document.getElementById("printBtn").addEventListener("click", () => window.print());
    document.getElementById("paymentForm").addEventListener("submit", handlePaymentSubmit);
    
    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
});

// DATA RETRIEVAL & CALCULATION LOGIC
function loadLedger() {
    let students = JSON.parse(localStorage.getItem("students")) || [];
    let payments = JSON.parse(localStorage.getItem("payments")) || [];
    let tableBody = document.getElementById("ledgerBody");
    
    tableBody.innerHTML = "";

    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No student records found in the database.</td></tr>`;
        return;
    }

    students.forEach(student => {
        let currentId = student.studentId || student.id || student.studentID || "Unknown ID";
        let currentName = student.name || student.fullName || "Unknown Name";
        let tuition = student.tuitionFee || 50000; 
        
        let studentPayments = payments.filter(p => p.studentId === currentId);
        let totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let balance = tuition - totalPaid;
        
        let status = "Outstanding";
        if (balance <= 0) {
            status = "Paid";
        } else if (totalPaid > 0) {
            status = "Pending";
        }

        let rowHTML = `
            <tr>
                <td>${currentId}</td>
                <td>${currentName}</td>
                <td>$${tuition.toFixed(2)}</td>
                <td>$${totalPaid.toFixed(2)}</td>
                <td>$${balance.toFixed(2)}</td>
                <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                <td class="admin-only">
                    <button class="btn-pay-quick" data-id="${currentId}">Record Payment</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += rowHTML;
    });

    attachQuickPayListeners();
    checkUserRole();
}

// PAYMENT PROCESSING
function handlePaymentSubmit(event) {
    event.preventDefault();

    let studentId = document.getElementById("payStudentId").value.trim();
    let amount = parseFloat(document.getElementById("payAmount").value);

    if (!studentId || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid Student ID and a positive amount.");
        return;
    }

    let payments = JSON.parse(localStorage.getItem("payments")) || [];
    
    let newPayment = {
        paymentId: "PAY" + Date.now(),
        studentId: studentId,
        amount: amount,
        date: new Date().toISOString().split('T')[0], 
        status: "Paid"
    };

    payments.push(newPayment);
    localStorage.setItem("payments", JSON.stringify(payments));
    
    document.getElementById("paymentForm").reset();
    alert(`Payment of $${amount.toFixed(2)} recorded for ${studentId}.`);
    loadLedger(); // Refresh table
}

function attachQuickPayListeners() {
    let quickPayButtons = document.querySelectorAll(".btn-pay-quick");
    quickPayButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            let studentId = e.target.getAttribute("data-id");
            document.getElementById("payStudentId").value = studentId;
            document.getElementById("payAmount").focus();
            
            document.getElementById("paymentForm").scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// SEARCH AND FILTER LOGIC
function filterLedger() {
    let search = document.getElementById("searchInput").value.toLowerCase();
    let statusFilter = document.getElementById("statusFilter").value;
    
    let rows = document.getElementById("ledgerBody").getElementsByTagName("tr");

    for (let row of rows) {
        if (row.cells.length < 7) continue;

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

// ROLE CHECK & LOGOUT
function checkUserRole() {
    let role = sessionStorage.getItem("currentUserRole");
    
    if (role === "Viewer") {
        document.querySelectorAll(".admin-only").forEach(el => {
            el.style.display = "none";
        });
    }
}

function handleLogout(event) {
    if(event) event.preventDefault(); 

    let confirmLogout = confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
        sessionStorage.removeItem("currentUserRole");
        sessionStorage.removeItem("currentUser");
        window.location.href = "../login.html"; 
    }
}

    

  
