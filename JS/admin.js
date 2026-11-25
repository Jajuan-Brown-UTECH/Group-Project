//Getting Items from localStorage
const students = JSON.parse(localStorage.getItem("students")) || [];

const grades = JSON.parse(localStorage.getItem("grades")) || [];

const payments = JSON.parse(localStorage.getItem("payments")) || [];

//Event Listeners for buttons
document.getElementById("studentForm").addEventListener("submit", saveStudent);

document.getElementById("enrol-button").addEventListener("click", assignEnrollment);

document.getElementById("grade-button").addEventListener("click", saveGrade);


//Save Student
function saveStudent(event) {
  event.preventDefault();


  //Getting Student Info
  const studentId = document.getElementById("studentId").value;

  const name = document.getElementById("name").value.trim();

  const email = document.getElementById("email").value.trim();

  const phone = document.getElementById("phone").value.trim();

  const form = document.getElementById("form").value;

  const status = document.getElementById("status").value;


  //Validation Sequences
  if (name === "" || email === "") {
    alert("All required fields must be completed");
    return;
  }

  const existing = students.find(student =>
    student.email === email &&
    student.studentId !== studentId
  );

  if (existing) {
    alert("Student already exists");
    return;
  }

  if (studentId === "") {
    createStudent(name, email, phone, form, status);
  }
  else {
    updateStudent(
      studentId,
      name,
      email,
      phone,
      form,
      status
    );
  }

  loadStudents();

  document.getElementById("studentForm").reset();
}

//Creating Student
function createStudent(
  name,
  email,
  phone,
  form,
  status
) {
  const student = {

    studentId: `STU${students.length + 1}`,
    name: name,
    email: email,
    phone: phone,
    form: form,
    status: status,

    classId: "",
    cohort: "",
    semester: ""
  };

  students.push(student);

  saveData();
}

function updateStudent(
  id,
  name,
  email,
  phone,
  form,
  status
) {
  const student =
    students.find(student =>
      student.studentId === id
    );

  if (!student) {
    return;
  }

  student.name = name;
  student.email = email;
  student.phone = phone;
  student.form = form;
  student.status = status;

  saveData();
}

//Loading Students for Display
function loadStudents() {
  const tableBody =
    document.getElementById("studentTableBody");

  tableBody.innerHTML = "";

  const formNames = {
    first: "1",
    second: "2",
    third: "3",
    fourth: "4",
    fifth: "5",
    "sixth-one": "6A",
    "sixth-two": "6B"
  };

  students.forEach(student => {
    tableBody.innerHTML += `
        <tr>
            <td>${student.studentId}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${formNames[student.form]}</td>
            <td>${student.status}</td>

            <td>
                <button id="edit-button" onclick="editStudent('${student.studentId}')">Edit</button>

                <button id="del-button" onclick="deleteStudent('${student.studentId}')"> Delete</button>
            </td>
        </tr>
        `;
  });
}

//Edit Student Info
function editStudent(id) {
  const student =
    students.find(student =>
      student.studentId === id
    );

  document.getElementById("studentId").value =
    student.studentId;

  document.getElementById("name").value =
    student.name;

  document.getElementById("email").value =
    student.email;

  document.getElementById("phone").value =
    student.phone;

  document.getElementById("form").value =
    student.form;

  document.getElementById("status").value =
    student.status;
}

function deleteStudent(id) {
  const confirmed =
    confirm(
      "Delete this student?"
    );

  if (!confirmed) {
    return;
  }

  const studentIndex =
    students.findIndex(student =>
      student.studentId === id
    );

  students.splice(studentIndex, 1);

  const newGrades =
    grades.filter(grade =>
      grade.studentId !== id
    );

  const newPayments =
    payments.filter(payment =>
      payment.studentId !== id
    );

  localStorage.setItem(
    "grades",
    JSON.stringify(newGrades)
  );

  localStorage.setItem(
    "payments",
    JSON.stringify(newPayments)
  );

  saveData();

  loadStudents();
}

//For the ID dropdowns
function populateStudentDropdowns() {
  const enrollmentDropdown = document.getElementById("enrollmentStudent");

  const gradeDropdown = document.getElementById("gradeStudent");

  enrollmentDropdown.innerHTML =
    '<option value="">Select Student</option>';

  gradeDropdown.innerHTML =
    '<option value="">Select Student</option>';

  students.forEach(student => {

    enrollmentDropdown.innerHTML += `
            <option value="${student.studentId}">
                ${student.name}
            </option>
        `;

    gradeDropdown.innerHTML += `
            <option value="${student.studentId}">
                ${student.name}
            </option>
        `;
  });
}

//Enrollment
function assignEnrollment() {
  const studentId = document.getElementById("enrollmentStudent").value;

  const classId = document.getElementById("className").value;

  const cohort = document.getElementById("cohort").value;

  const semester = document.getElementById("semester").value;

  const student =
    students.find(student =>
      student.studentId === studentId
    );

  student.classId = classId;
  student.cohort = cohort;
  student.semester = semester;

  saveData();

  alert(
    "Enrollment updated."
  );
}


//Saving Grades
function saveGrade() {
  const studentId = document.getElementById("gradeStudent").value;

  const module = document.getElementById("module").value;

  const score = Number(document.getElementById("grade").value);

  const gradeRecord =
  {
    gradeId: Date.now(),
    studentId: studentId,
    module: module,
    score: score
  };

  grades.push(
    gradeRecord
  );

  localStorage.setItem(
    "grades",
    JSON.stringify(grades)
  );

  alert(
    "Grade saved."
  );
}

//Saving All Data
function saveData() {
  localStorage.setItem(
    "students",
    JSON.stringify(students)
  );
}

loadStudents();
populateStudentDropdowns();