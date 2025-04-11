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
});

// Notice Management
function loadNotices() {
    get(noticesRef).then(snapshot => {
        const notices = snapshot.val() || [
            "New Admission Process Started - Check Admission Section",
            "Annual Sports Day on 15th December 2025",
            "Parent-Teacher Meeting Scheduled for 20th November 2025"
        ];
        displayNotices(notices);
    });
}

function displayNotices(notices) {
    const noticesList = document.getElementById('notices');
    if (noticesList) {
        noticesList.innerHTML = notices.map(notice => `<li>${notice}</li>`).join('');
    }
}

// Gallery Management
function initGallery() {
    const galleryContainer = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modalImage');
    let filteredData = [];

    function getYouTubeEmbedUrl(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? 
            `https://www.youtube.com/embed/${match[2]}` : 
            null;
    }

    function displayGalleryItems(items, filter = 'all') {
        if (!galleryContainer) return;

        filteredData = items.filter(item => filter === 'all' || item.type === filter);
        
        galleryContainer.innerHTML = filteredData.map((item, index) => {
            if (item.type === 'image') {
                return `
                    <div class="gallery-item" onclick="openModal(${index})">
                        <img src="${item.url}" alt="${item.title}">
                        <div class="gallery-title">${item.title}</div>
                    </div>
                `;
            } else if (item.type === 'video') {
                const embedUrl = getYouTubeEmbedUrl(item.url);
                return embedUrl ? `
                    <div class="gallery-item video">
                        <iframe src="${embedUrl}" 
                                title="${item.title}"
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                        <div class="gallery-title">${item.title}</div>
                    </div>
                ` : '';
            }
            return '';
        }).join('');
    }

    // Load and display gallery items
    get(galleryRef).then(snapshot => {
        const items = snapshot.val() || [];
        displayGalleryItems(items);

        // Set up filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                displayGalleryItems(items, filter);
            });
        });
    });

    // Modal functionality
    window.openModal = function(index) {
        const item = filteredData[index];
        if (item && item.type === 'image') {
            modalImage.src = item.url;
            modal.style.display = "block";
        }
    };

    window.closeModal = function() {
        modal.style.display = "none";
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Student Form
function setupStudentForm() {
    const form = document.getElementById('studentForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('studentCode').value;
        const name = document.getElementById('studentName').value;
        const dob = document.getElementById('studentDob').value;

        get(studentsRef).then(snapshot => {
            const students = snapshot.val() || [];
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
    });
}
