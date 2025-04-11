// Section Management
function showSection(sectionId) {
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Show home section by default
    showSection('home');

    // Check admin status
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.style.display = isAdmin ? 'block' : 'none';
    }

    // Load notices from localStorage
    loadNotices();

    // Initialize gallery
    initGallery();

    // Setup student form
    setupStudentForm();

    // Setup modal close button
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    // Close modal when clicking outside the image
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
});

// Modal Functions
function openModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = imageUrl;
}

// Notice Management
function loadNotices() {
    const notices = JSON.parse(localStorage.getItem('notices')) || [
        "New Admission Process Started - Check Admission Section",
        "Annual Sports Day on 15th December 2025",
        "Parent-Teacher Meeting Scheduled for 20th November 2025"
    ];
    const noticesList = document.getElementById('notices');
    if (noticesList) {
        noticesList.innerHTML = notices.map(notice => `<li>${notice}</li>`).join('');
    }
}

// Gallery Management
function initGallery() {
    const galleryContainer = document.querySelector('.gallery-container');
    if (!galleryContainer) return;

    let currentPage = 0;
    const itemsPerPage = 16; // 2x8 grid
    let filteredData = [];

    function loadGalleryData() {
        return JSON.parse(localStorage.getItem('galleryItems')) || [];
    }

    function getYouTubeEmbedUrl(url) {
        // Handle different YouTube URL formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? 
            `https://www.youtube.com/embed/${match[2]}` : 
            null;
    }

    function renderGallery() {
        const start = currentPage * itemsPerPage;
        const items = filteredData.slice(start, start + itemsPerPage);
        
        galleryContainer.innerHTML = items.map(item => {
            if (item.type === 'video') {
                const embedUrl = getYouTubeEmbedUrl(item.url);
                if (embedUrl) {
                    return `<div class="gallery-item video-item">
                        <iframe 
                            src="${embedUrl}" 
                            title="${item.title}"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                        ></iframe>
                    </div>`;
                } else {
                    return `<div class="gallery-item">
                        <video src="${item.url}" controls title="${item.title}"></video>
                    </div>`;
                }
            } else {
                return `<div class="gallery-item" onclick="openModal('${item.url}')">
                    <img src="${item.url}" alt="${item.title}" loading="lazy">
                </div>`;
            }
        }).join('');

        // Update pagination buttons
        const prevBtn = document.getElementById('prevGallery');
        const nextBtn = document.getElementById('nextGallery');
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = (currentPage + 1) * itemsPerPage >= filteredData.length;

        // Show/hide no items message
        const noItemsMsg = document.getElementById('noGalleryItems');
        if (noItemsMsg) {
            noItemsMsg.style.display = filteredData.length === 0 ? 'block' : 'none';
        }
    }

    function filterGallery(type) {
        currentPage = 0;
        const allData = loadGalleryData();
        filteredData = type === 'all' ? allData : allData.filter(item => item.type === type);
        renderGallery();
    }

    // Event Listeners
    document.getElementById('prevGallery')?.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            renderGallery();
        }
    });

    document.getElementById('nextGallery')?.addEventListener('click', () => {
        if ((currentPage + 1) * itemsPerPage < filteredData.length) {
            currentPage++;
            renderGallery();
        }
    });

    document.getElementById('showPhotos')?.addEventListener('click', () => filterGallery('photo'));
    document.getElementById('showVideos')?.addEventListener('click', () => filterGallery('video'));
    document.getElementById('showAll')?.addEventListener('click', () => filterGallery('all'));

    // Initial load
    filterGallery('all');
}

// Student Information Form
function setupStudentForm() {
    const studentForm = document.getElementById('studentForm');
    if (!studentForm) return;

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('studentCode').value;
        const name = document.getElementById('studentName').value;
        const dob = document.getElementById('studentDob').value;

        // Get stored students data
        const students = JSON.parse(localStorage.getItem('students')) || [];
        
        // Find matching student
        const student = students.find(s => 
            s.code.toLowerCase() === code.toLowerCase() && 
            s.name.toLowerCase() === name.toLowerCase() && 
            s.dob === dob
        );

        if (student) {
            document.getElementById('results').innerHTML = `
                <div class="success" style="background: #e6fffa; padding: 1rem; border-radius: 8px; border: 1px solid #38b2ac;">
                    <h3 style="color: #2c5282; margin-bottom: 0.5rem;">Student Information</h3>
                    <p><strong>Name:</strong> ${student.name}</p>
                    <p><strong>Class:</strong> ${student.class || 'N/A'}</p>
                    <p><strong>Father's Name:</strong> ${student.fathersName || 'N/A'}</p>
                    <p><strong>Mother's Name:</strong> ${student.mothersName || 'N/A'}</p>
                    <p><strong>Contact:</strong> ${student.contact || 'N/A'}</p>
                    <p><strong>Address:</strong> ${student.address || 'N/A'}</p>
                </div>`;
        } else {
            document.getElementById('results').innerHTML = `
                <div class="error" style="background: #fff5f5; padding: 1rem; border-radius: 8px; border: 1px solid #fc8181; color: #c53030;">
                    No matching student found. Please check your details and try again.
                </div>`;
        }
    });
}
