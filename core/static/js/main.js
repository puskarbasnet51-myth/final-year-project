// FeedForward — main.js

// ── Modal handling ─────────────────────────────────────────
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking overlay
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(function(m) {
            m.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});

// ── Auto hide messages ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const msgs = document.querySelectorAll('.message');
    msgs.forEach(function(msg) {
        setTimeout(function() {
            msg.style.opacity = '0';
            msg.style.transition = 'opacity 0.5s';
            setTimeout(function() { msg.remove(); }, 500);
        }, 4000);
    });
});

// ── Confirm delete ─────────────────────────────────────────
function confirmDelete(msg) {
    return confirm(msg || 'Are you sure you want to delete this?');
}