document.addEventListener("DOMContentLoaded", () => {
    
    // Load the ledger table data when the page opens
    loadLedger();

    // Bind Event Listeners to HTML Elements
    document.getElementById("searchInput").addEventListener("keyup", filterLedger);
    document.getElementById("statusFilter").addEventListener("change", filterLedger);
    document.getElementById("printBtn").addEventListener("click", () => window.print());
    document.getElementById("paymentForm").addEventListener("submit", handlePaymentSubmit);
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
});


//  DATA RETRIEVAL & CALCULATION LOGIC

function loadLedger() {
    // Retrieve shared data from Student 2 & 3's localStorage structure
    let students = JSON.parse(localStorage.getItem("students")) || [];
    let payments = JSON.parse(localStorage.getItem("payments")) || [];
    let tableBody = document.getElementById("ledgerBody");
    
    // Clear existing rows
    tableBody.innerHTML = "";

    // Handle empty state
    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No student records found in the database.</td></tr>`;
        return;
    }

    // Loop through every student to build the ledger
    students.forEach(student => {
        // Calculate total paid by filtering the payments array for this student
        let studentPayments = payments.filter(p => p.studentId === student.id);
        
        // Sum up the amounts (using reduce to add them all together)
        let totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // Calculate the outstanding balance
        let tuition = student.tuitionFee || 50000; // Default fallback if admin didn't set it
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

    // After rendering rows, attach listeners to the new "Record Payment" buttons
    attachQuickPayListeners();
    
    // Enforce Role-Based Access Control (Hide admin stuff from viewers)
    checkUserRole();
}


//  PAYMENT PROCESSING

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
        date: new Date().toISOString().split('T')[0], 
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
            
          
            document.getElementById("payStudentId").value = studentId;
            
            document.getElementById("payAmount").focus();
            
            
            document.querySelector(".payment-entry").scrollIntoView({ behavior: 'smooth' });
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

        // Show or hide the row based on matches
        if (matchesSearch && matchesStatus) {
            row.style.display = ""; 
        } else {
            row.style.display = "none"; 
        }
    }
}


// ROLE CHECK & LOGOUT (Viewer Safety)

function checkUserRole() {
    // Student 2's auth.js should save the role in sessionStorage upon login
    let role = sessionStorage.getItem("currentUserRole");
    
    // If the user is a Viewer, hide all admin-only elements
    // (This hides the payment form and the action column)
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

// Select the logout button
const logoutBtn = document.getElementById('logoutBtn');

// Add a click event listener
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(event) {
    event.preventDefault(); 
    
    // Clear any saved user data 
    // localStorage.clear(); 
    
    //  Confirm with the user
    let confirmLogout = confirm("Are you sure you want to log out?");
    
    //  Redirect to the login page
    if (confirmLogout) {
      window.location.href = "../login.html"; 
    }
  });
}
   

           

