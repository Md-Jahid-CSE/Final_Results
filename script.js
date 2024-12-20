import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3apClju_y721K4kCo6w0kUWjk4DvY5Lc",
    authDomain: "result-cse.firebaseapp.com",
    databaseURL: "https://result-cse-default-rtdb.firebaseio.com",
    projectId: "result-cse",
    storageBucket: "result-cse.firebasestorage.app",
    messagingSenderId: "614915862134",
    appId: "1:614915862134:web:8e45079bdda02a1a52f957"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Helper function to safely parse numbers, returns 0 if parsing fails
function safeParse(value) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}

// Toggle profile options visibility
function toggleOptions() {
    const options = document.getElementById('options');
    options.style.display = (options.style.display === 'none' || options.style.display === '') ? 'block' : 'none';
}

// Expose toggleOptions globally
window.toggleOptions = toggleOptions;  

// Show Highest marks function
function showHighest() {
    const subject = document.getElementById('highestSubject').value;
    const resultDiv = document.getElementById('highestResult');
    resultDiv.innerHTML = '';

    const subjectRef = ref(database, 'marksData/' + subject);

    get(subjectRef).then((snapshot) => {
        const students = snapshot.val();

        if (!students) {
            resultDiv.innerHTML = "<p class='error'>No data available for the selected subject.</p>";
            return;
        }

        const highestEntry = Object.entries(students).reduce((max, [id, student]) => {
            const totalMarks = safeParse(student.total);

            const maxTotal = max.total || 0;
            return totalMarks > maxTotal ? { id, name: student.name, total: totalMarks } : max;
        }, {});

        if (!highestEntry.name) {
            resultDiv.innerHTML = "<p class='error'>No highest marks data available.</p>";
        } else {
            const lastThreeDigits = highestEntry.id.slice(-3);
            resultDiv.innerHTML = `
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Highest Scorer:</strong> ${highestEntry.name} (ID: ${lastThreeDigits})</p>
                <p><strong>Total Marks:</strong> ${highestEntry.total.toFixed(2)}</p>
            `;
        }
    }).catch(error => {
        resultDiv.innerHTML = "<p class='error'>Error fetching data: " + error.message + "</p>";
    });
}

// Expose showHighest globally
window.showHighest = showHighest;  

// Show student result function
function showStudentResult() {
    const id = document.getElementById('studentID').value.trim();
    const nameInput = document.getElementById('studentName').value.trim().toLowerCase().replace(/\./g, '');
    const subject = document.getElementById('studentSubject').value;
    const resultDiv = document.getElementById('studentResult');
    resultDiv.innerHTML = '';

    if (!id || !nameInput) {
        resultDiv.innerHTML = "<p class='error'>Please enter both ID and Name.</p>";
        return;
    }

    const subjectRef = ref(database, 'marksData/' + subject);

    get(subjectRef).then((snapshot) => {
        const students = snapshot.val();

        if (!students) {
            resultDiv.innerHTML = "<p class='error'>No data available for the selected subject.</p>";
            return;
        }

        // Search for the student by ID and Name
        const foundEntry = Object.entries(students).find(([studentId, studentData]) =>
            studentId.trim() === id.trim() &&
            studentData.name.trim().toLowerCase().replace(/\./g, '') === nameInput
        );

        if (!foundEntry) {
            resultDiv.innerHTML = "<p class='error'>No matching record found.</p>";
        } else {
            const [studentId, student] = foundEntry;
            const totalMarks = safeParse(student.total); // Fetch total directly from Firebase

            const lastThreeDigits = studentId.slice(-3);
            resultDiv.innerHTML = `
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Name:</strong> ${student.name} (ID: ${lastThreeDigits})</p>
                <p><strong>Total Marks:</strong> ${totalMarks.toFixed(2)} Out of 120</p>
                <p><strong>Attendance:</strong> ${student.attendance}</p>
                <p><strong>CT1:</strong> ${student.ct1}</p>
                <p><strong>CT2:</strong> ${student.ct2}</p>
                <p><strong>CT3:</strong> ${student.ct3}</p>
                <p><strong>CT:</strong> ${student.ct}</p>
                <p><strong>Performance:</strong> ${student.performance}</p>
                <p><strong>Assignment:</strong> ${student.assignment}</p>
                <p><strong>Midterm:</strong> ${student.midterm}</p>
            `;
        }
    }).catch(error => {
        resultDiv.innerHTML = "<p class='error'>Error fetching data: " + error.message + "</p>";
    });
}


// Expose showStudentResult globally
window.showStudentResult = showStudentResult; 
