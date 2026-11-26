document.addEventListener("DOMContentLoaded", () => {
    
    loadLedger();

    // Event Listeners to HTML Elements
    document.getElementById("searchInput").addEventListener("keyup", filterLedger);
    document.getElementById("statusFilter").addEventListener("change", filterLedger);
    document.getElementById("printBtn").addEventListener("click", () => window.print());
    document.getElementById("paymentForm").addEventListener("submit", handlePaymentSubmit);
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
});


// DATA RETRIEVAL & CALCULATION LOGIC

function loadLedger() {
    // Retrieve shared data from Student's localStorage
    let students = JSON.parse(localStorage.getItem("students")) || [];
    let payments = JSON.parse(localStorage.getItem("payments")) || [];
    let tableBody = document.getElementById("ledgerBody");
    
    // Clear existing rows
    tableBody.innerHTML = "";

  
    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No student records found in the database.</td></tr>`;
        return;
    }

    // Loop through every student to build the ledger
    students.forEach(student => {
        // Calculate total paid by filtering the payments array for student
        let studentPayments = payments.filter(p => p.studentId === student.id);
        
        // Sum up the amounts 
        let totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // Calculate the outstanding balance
        let tuition = student.tuitionFee || 50000; 
        let balance = tuition - totalPaid;
        
        // Determine Payment Status dynamically
        let status = "Outstanding"; // Default
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
                <td class="admin-only">
                    <button class="btn-pay-quick" data-id="${student.id}">Record Payment</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += rowHTML;
    });

    attachQuickPayListeners();
    
    checkUserRole();
}

//PAYMENT PROCESSING

function handlePaymentSubmit(event) {
    // Prevent the form from refreshing the page
    event.preventDefault();

    let studentId = document.getElementById("payStudentId").value.trim();
    let amountInput = document.getElementById("payAmount").value;
    let amount = parseFloat(amountInput);

    // Validation: Ensure ID exists and amount is a positive number
    if (!studentId || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid Student ID and a positive amount.");
        return;
    }

    // Get existing payments from storage
    let payments = JSON.parse(localStorage.getItem("payments")) || [];
    
    // Create new payment record
    let newPayment = {
        paymentId: "PAY" + Date.now(),
        studentId: studentId,
        amount: amount,
        date: new Date().toISOString().split('T')[0], // Current date (YYYY-MM-DD)
        status: "Paid"
    };

    // Save to localStorage
    payments.push(newPayment);
    localStorage.setItem("payments", JSON.stringify(payments));
    
    // Reset form and reload table to show updated balances
    document.getElementById("paymentForm").reset();
    alert(`Payment of $${amount.toFixed(2)} recorded for ${studentId}.`);
    loadLedger();
}

// Connects the "Record Payment" buttons inside the table to the form
function attachQuickPayListeners() {
    let quickPayButtons = document.querySelectorAll(".btn-pay-quick");
    quickPayButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            let studentId = e.target.getAttribute("data-id");
            
            // Auto-fill the form at the bottom with the selected student's ID
            document.getElementById("payStudentId").value = studentId;
            
            // Focus on the amount field
            document.getElementById("payAmount").focus();
            
            // Smooth scroll down to the payment form
            document.querySelector(".payment-entry").scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// SEARCH AND FILTER LOGIC

function filterLedger() {
    let search = document.getElementById("searchInput").value.toLowerCase();
    let statusFilter = document.getElementById("statusFilter").value;
    
    // Get all rows in the tbody
    let rows = document.getElementById("ledgerBody").getElementsByTagName("tr");

    for (let row of rows) {
        // Skip the "No records" row if it exists
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
    
    // If the user is a Viewer, hide all admin-only elements
 
    if (role === "Viewer") {
        document.querySelectorAll(".admin-only").forEach(el => {
            el.style.display = "none";
        });
    }
}

function handleLogout() {
    // Clear session and redirect to login page
    sessionStorage.removeItem("currentUserRole");
    sessionStorage.removeItem("currentUser");
    window.location.href = "../login.html";
}
