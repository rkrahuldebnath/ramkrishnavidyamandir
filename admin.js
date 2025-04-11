// Import Firebase v9 modular SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';

// Initialize Firebase app
const firebaseConfig = {
  apiKey: '<API_KEY>',
  authDomain: '<AUTH_DOMAIN>',
  projectId: '<PROJECT_ID>',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin Authentication
document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const loginSection = document.getElementById('login');
    const dashboard = document.getElementById('dashboard');
    const securityMessage = document.getElementById('securityMessage');

    // Normal authentication flow
    if (!isAdmin) {
        if (loginSection) loginSection.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    } else {
        if (loginSection) loginSection.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        loadDashboardData();
    }
});

// Check if user is authenticated
function checkAuth() {
    if (localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'index.html';
    }
}

// Create error message element
function showError(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.getElementById('loginForm').insertBefore(errorDiv, document.querySelector('.form-actions'));
}

// Login Form Handler
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Remove any existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    if (!username || !password) {
        showError('Please enter both email and password');
        return;
    }

    if (username === 'wheelchairrk@gmail.com' && password === 'rk9862') {
        localStorage.setItem('isAdmin', 'true');
        location.reload();
    } else {
        showError('Invalid email or password');
        document.getElementById('password').value = ''; // Clear password field
    }
});

// Tab Management
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.nav-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Load Dashboard Data
function loadDashboardData() {
    // First check authentication
    checkAuth();
    
    // Only load data if authenticated
    if (localStorage.getItem('isAdmin') === 'true') {
        loadNotices();
        loadStudents();
        loadGallery();
    }
}

// Notice Management
function loadNotices() {
    get(noticesRef).then(snapshot => {
        const notices = snapshot.val() || [];
        const noticeList = document.getElementById('noticeList');
        if (!noticeList) return;

        noticeList.innerHTML = notices.map((notice, index) => `
            <li>
                ${notice}
                <button onclick="deleteNotice(${index})" class="btn">Delete</button>
            </li>
        `).join('');
    });
}

function addNotice() {
    const noticeText = document.getElementById('newNotice').value;
    if (!noticeText) return;

    get(noticesRef).then(snapshot => {
        const notices = snapshot.val() || [];
        notices.unshift(noticeText);
        set(noticesRef, notices).then(() => {
            document.getElementById('newNotice').value = '';
            loadNotices();
        });
    });
}

function deleteNotice(index) {
    get(noticesRef).then(snapshot => {
        const notices = snapshot.val() || [];
        notices.splice(index, 1);
        set(noticesRef, notices).then(() => {
            loadNotices();
        });
    });
}

// Student Management
function loadStudents() {
    get(studentsRef).then(snapshot => {
        const students = snapshot.val() || [];
        const studentList = document.getElementById('studentList');
        if (!studentList) return;

        studentList.innerHTML = students.map((student, index) => `
            <li>
                Code: ${student.code} | Name: ${student.name} | DOB: ${student.dob}
                <button onclick="deleteStudent(${index})" class="btn">Delete</button>
            </li>
        `).join('');
    });
}

function addStudent() {
    const student = {
        code: document.getElementById('studentCode').value,
        name: document.getElementById('studentName').value,
        dob: document.getElementById('studentDob').value,
        class: document.getElementById('studentClass').value,
        mothersName: document.getElementById('mothersName').value,
        fathersName: document.getElementById('fathersName').value,
        address: document.getElementById('address').value,
        contact: document.getElementById('contact').value
    };

    if (!student.code || !student.name) return;

    get(studentsRef).then(snapshot => {
        const students = snapshot.val() || [];
        students.push(student);
        set(studentsRef, students).then(() => {
            // Clear form
            document.querySelectorAll('#studentsTab input').forEach(input => {
                input.value = '';
            });
            loadStudents();
        });
    });
}

function deleteStudent(index) {
    get(studentsRef).then(snapshot => {
        const students = snapshot.val() || [];
        students.splice(index, 1);
        set(studentsRef, students).then(() => {
            loadStudents();
        });
    });
}

// Gallery Management
function loadGallery() {
    get(galleryRef).then(snapshot => {
        const gallery = snapshot.val() || [];
        const galleryList = document.getElementById('galleryList');
        if (!galleryList) return;

        galleryList.innerHTML = gallery.map((item, index) => `
            <li>
                ${item.title} (${item.type})
                <button onclick="deleteGalleryItem(${index})" class="btn">Delete</button>
            </li>
        `).join('');
    });
}

function addGalleryItem() {
    let url = document.getElementById('galleryUrl').value;
    const title = document.getElementById('galleryTitle').value;
    const type = document.getElementById('galleryType').value;

    if (!url || !title) return;

    // Handle different types of URLs
    if (type === 'photo') {
        // Extract image URL from HTML if pasted
        if (url.includes('<img')) {
            const match = url.match(/src="([^"]+)"/);
            if (match && match[1]) {
                url = match[1];
            }
        }
    } else if (type === 'video') {
        // Clean up YouTube URL if needed
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // URL will be processed by getYouTubeEmbedUrl() in main.js
            // Just ensure it's a clean URL
            url = url.trim();
        }
    }

    get(galleryRef).then(snapshot => {
        const gallery = snapshot.val() || [];
        gallery.push({ url, title, type });
        set(galleryRef, gallery).then(() => {
            document.getElementById('galleryUrl').value = '';
            document.getElementById('galleryTitle').value = '';
            loadGallery();
        });
    });
}

function deleteGalleryItem(index) {
    get(galleryRef).then(snapshot => {
        const gallery = snapshot.val() || [];
        gallery.splice(index, 1);
        set(galleryRef, gallery).then(() => {
            loadGallery();
        });
    });
}

// Logout
function logout() {
    localStorage.removeItem('isAdmin');
    window.location.href = 'index.html';
}

// Create error message element
function showError(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.getElementById('loginForm').insertBefore(errorDiv, document.querySelector('.form-actions'));
}
