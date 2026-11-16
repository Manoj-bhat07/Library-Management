/* ============================================================
   Library Management System - Frontend logic
   Talks to the Spring Boot REST API using fetch().
   ============================================================ */

// Change this if your backend runs on a different port.
const API_BASE = "http://localhost:8080/api/books";
const STUDENT_API_BASE = "http://localhost:8080/api/students";
const ISSUE_API_BASE = "http://localhost:8080/api/issues";

/* ---------------- Application state ---------------- */
const state = {
    books: [],
    allBooks: [],
    editingId: null,
    deletingId: null,
    searchTerm: "",
    categoryFilter: "",
    sortBy: "default",
    view: "list",
    requestId: 0,
    students: [],
    studentSearchTerm: "",
    editingStudentId: null,
    deletingStudentId: null,
    studentsLoaded: false,
    issues: [],
    issueSearchTerm: "",
    issuesLoaded: false,
    activeSection: "books"
};

/* ---------------- Element references ---------------- */
const els = {
    totalCount: document.getElementById("totalCount"),
    headerStatLabel: document.querySelector(".stat-label"),
    workspaceTitle: document.getElementById("workspaceTitle"),
    booksSection: document.getElementById("booksSection"),
    studentsSection: document.getElementById("studentsSection"),
    issuesSection: document.getElementById("issuesSection"),
    booksNavBtn: document.getElementById("booksNavBtn"),
    studentsNavBtn: document.getElementById("studentsNavBtn"),
    issuesNavBtn: document.getElementById("issuesNavBtn"),
    catalogTitleCount: document.getElementById("catalogTitleCount"),
    totalCopyCount: document.getElementById("totalCopyCount"),
    lowStockCount: document.getElementById("lowStockCount"),
    outOfStockCount: document.getElementById("outOfStockCount"),
    categoryBreakdown: document.getElementById("categoryBreakdown"),
    resultCount: document.getElementById("resultCount"),
    searchInput: document.getElementById("searchInput"),
    clearSearch: document.getElementById("clearSearch"),
    categoryFilter: document.getElementById("categoryFilter"),
    sortBooks: document.getElementById("sortBooks"),
    listViewBtn: document.getElementById("listViewBtn"),
    gridViewBtn: document.getElementById("gridViewBtn"),
    addBookBtn: document.getElementById("addBookBtn"),
    tableBody: document.getElementById("bookTableBody"),
    bookTable: document.querySelector(".book-table"),
    bookGrid: document.getElementById("bookGrid"),
    loadingState: document.getElementById("loadingState"),
    emptyState: document.getElementById("emptyState"),
    emptyTitle: document.getElementById("emptyTitle"),
    emptyText: document.getElementById("emptyText"),
    errorState: document.getElementById("errorState"),
    errorText: document.getElementById("errorText"),
    retryBtn: document.getElementById("retryBtn"),

    bookModal: document.getElementById("bookModal"),
    modalTitle: document.getElementById("modalTitle"),
    modalSubtitle: document.getElementById("modalSubtitle"),
    bookForm: document.getElementById("bookForm"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    cancelBtn: document.getElementById("cancelBtn"),
    saveBtn: document.getElementById("saveBtn"),
    saveBtnText: document.getElementById("saveBtnText"),
    title: document.getElementById("title"),
    author: document.getElementById("author"),
    category: document.getElementById("category"),
    quantity: document.getElementById("quantity"),

    deleteModal: document.getElementById("deleteModal"),
    deleteBookName: document.getElementById("deleteBookName"),
    cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

    studentSearchInput: document.getElementById("studentSearchInput"),
    studentResultCount: document.getElementById("studentResultCount"),
    studentTable: document.querySelector(".student-table"),
    studentTableBody: document.getElementById("studentTableBody"),
    studentLoadingState: document.getElementById("studentLoadingState"),
    studentEmptyState: document.getElementById("studentEmptyState"),
    studentEmptyTitle: document.getElementById("studentEmptyTitle"),
    studentEmptyText: document.getElementById("studentEmptyText"),
    studentErrorState: document.getElementById("studentErrorState"),
    studentErrorText: document.getElementById("studentErrorText"),
    retryStudentsBtn: document.getElementById("retryStudentsBtn"),
    addStudentBtn: document.getElementById("addStudentBtn"),
    studentModal: document.getElementById("studentModal"),
    studentModalTitle: document.getElementById("studentModalTitle"),
    studentModalSubtitle: document.getElementById("studentModalSubtitle"),
    studentForm: document.getElementById("studentForm"),
    studentId: document.getElementById("studentId"),
    studentName: document.getElementById("studentName"),
    closeStudentModalBtn: document.getElementById("closeStudentModalBtn"),
    cancelStudentBtn: document.getElementById("cancelStudentBtn"),
    saveStudentBtn: document.getElementById("saveStudentBtn"),
    saveStudentBtnText: document.getElementById("saveStudentBtnText"),
    deleteStudentModal: document.getElementById("deleteStudentModal"),
    deleteStudentName: document.getElementById("deleteStudentName"),
    cancelStudentDeleteBtn: document.getElementById("cancelStudentDeleteBtn"),
    confirmStudentDeleteBtn: document.getElementById("confirmStudentDeleteBtn"),

    issueSearchInput: document.getElementById("issueSearchInput"),
    issueResultCount: document.getElementById("issueResultCount"),
    issueTable: document.getElementById("issueTable"),
    issueTableBody: document.getElementById("issueTableBody"),
    issueLoadingState: document.getElementById("issueLoadingState"),
    issueEmptyState: document.getElementById("issueEmptyState"),
    issueEmptyTitle: document.getElementById("issueEmptyTitle"),
    issueEmptyText: document.getElementById("issueEmptyText"),
    issueErrorState: document.getElementById("issueErrorState"),
    issueErrorText: document.getElementById("issueErrorText"),
    retryIssuesBtn: document.getElementById("retryIssuesBtn"),
    newIssueBtn: document.getElementById("newIssueBtn"),
    issueModal: document.getElementById("issueModal"),
    closeIssueModalBtn: document.getElementById("closeIssueModalBtn"),
    cancelIssueBtn: document.getElementById("cancelIssueBtn"),
    issueForm: document.getElementById("issueForm"),
    issueStudentSelect: document.getElementById("issueStudentSelect"),
    issueBookSelect: document.getElementById("issueBookSelect"),
    issueFormHint: document.getElementById("issueFormHint"),
    confirmIssueBtn: document.getElementById("confirmIssueBtn"),
    confirmIssueBtnText: document.getElementById("confirmIssueBtnText"),

    toastContainer: document.getElementById("toastContainer")
};

/* ============================================================
   API helpers
   ============================================================ */

/**
 * Calls the backend and returns parsed JSON.
 * Throws an Error that may contain `fieldErrors` for validation problems.
 */
async function apiRequest(path = "", options = {}, baseUrl = API_BASE) {
    let response;

    try {
        response = await fetch(baseUrl + path, {
            headers: { "Content-Type": "application/json" },
            ...options
        });
    } catch (networkError) {
        throw new Error("Cannot connect to the server. Is the Spring Boot backend running?");
    }

    if (response.status === 204) {
        return null;
    }

    let data = null;
    try {
        data = await response.json();
    } catch (ignored) {
        // Some errors (rare) may not have a JSON body.
    }

    if (!response.ok) {
        const error = new Error(
            (data && data.message) || `Request failed with status ${response.status}`
        );
        error.status = response.status;
        error.fieldErrors = (data && data.errors) || {};
        throw error;
    }

    return data;
}

function studentApiRequest(path = "", options = {}) {
    return apiRequest(path, options, STUDENT_API_BASE);
}

function issueApiRequest(path = "", options = {}) {
    return apiRequest(path, options, ISSUE_API_BASE);
}

/* ============================================================
   Loading and rendering
   ============================================================ */

async function loadBooks() {
    const currentRequest = ++state.requestId;
    showState("loading");

    try {
        const books = await apiRequest();

        if (currentRequest !== state.requestId) return;

        state.allBooks = books;
        renderDashboard(books);
        updateCategoryOptions(books);
        updateCatalog();
    } catch (error) {
        if (currentRequest !== state.requestId) return;
        els.errorText.textContent = error.message;
        showState("error");
    }
}

async function loadTotalCount() {
    try {
        const data = await apiRequest("/count");
        if (state.activeSection === "books") {
            els.totalCount.textContent = data.count;
        }
    } catch (error) {
        if (state.activeSection === "books") {
            els.totalCount.textContent = "—";
        }
    }
}

function renderDashboard(books) {
    const quantities = books.map(book => Number(book.quantity));
    els.catalogTitleCount.textContent = books.length;
    els.totalCopyCount.textContent = quantities.reduce((total, quantity) => total + quantity, 0);
    els.lowStockCount.textContent = quantities.filter(quantity => quantity > 0 && quantity <= 2).length;
    els.outOfStockCount.textContent = quantities.filter(quantity => quantity === 0).length;

    const categories = new Map();
    books.forEach(book => {
        const category = book.category || "Uncategorized";
        categories.set(category, (categories.get(category) || 0) + 1);
    });

    const breakdown = [...categories.entries()]
        .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]));
    const largestCategory = Math.max(0, ...breakdown.map(([, count]) => count));

    els.categoryBreakdown.innerHTML = breakdown.length
        ? breakdown.map(([category, count]) => {
            const percentage = largestCategory ? Math.round(count / largestCategory * 100) : 0;
            return `
                <div class="category-row">
                    <span class="category-name">${escapeHtml(category)}</span>
                    <span class="category-track" aria-hidden="true">
                        <span style="width: ${percentage}%"></span>
                    </span>
                    <strong class="category-count">${count}</strong>
                </div>
            `;
        }).join("")
        : '<p class="category-empty">No categories to show yet.</p>';
}

function updateCategoryOptions(books) {
    const selectedCategory = state.categoryFilter;
    const categories = [...new Set(books.map(book => book.category).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second));

    els.categoryFilter.innerHTML = '<option value="">All categories</option>' +
        categories.map(category =>
            `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
        ).join("");

    if (categories.some(category => category.toLocaleLowerCase() === selectedCategory.toLocaleLowerCase())) {
        els.categoryFilter.value = categories.find(
            category => category.toLocaleLowerCase() === selectedCategory.toLocaleLowerCase()
        );
    } else {
        state.categoryFilter = "";
    }
}

function updateCatalog() {
    const keyword = state.searchTerm.toLocaleLowerCase();
    const category = state.categoryFilter.toLocaleLowerCase();
    const books = state.allBooks.filter(book => {
        const matchesKeyword = !keyword ||
            book.title.toLocaleLowerCase().includes(keyword) ||
            book.author.toLocaleLowerCase().includes(keyword);
        const matchesCategory = !category || book.category.toLocaleLowerCase() === category;
        return matchesKeyword && matchesCategory;
    });

    if (state.sortBy !== "default") {
        const [field, direction] = state.sortBy.split("-");
        books.sort((first, second) => {
            const comparison = field === "quantity"
                ? Number(first.quantity) - Number(second.quantity)
                : first[field].localeCompare(second[field]);
            return direction === "desc" ? -comparison : comparison;
        });
    }

    state.books = books;
    renderBooks(books);
    showState(books.length ? "table" : "empty");
}

function renderBooks(books) {
    els.tableBody.innerHTML = books.map(book => {
        const quantity = Number(book.quantity);
        const qtyClass = quantity === 0 ? "qty-out" : quantity <= 2 ? "qty-low" : "";
        const qtyText = quantity === 0 ? "Out of stock" : `${quantity} in stock`;

        return `
            <tr>
                <td class="cell-id">#${book.id}</td>
                <td class="cell-title">${escapeHtml(book.title)}</td>
                <td class="cell-author">${escapeHtml(book.author)}</td>
                <td><span class="category-chip">${escapeHtml(book.category)}</span></td>
                <td>
                    <span class="qty-badge ${qtyClass}">
                        <span class="qty-dot"></span>${qtyText}
                    </span>
                </td>
                <td>
                    <div class="row-actions">
                        <button type="button" class="action-btn edit" data-action="edit"
                                data-id="${book.id}" title="Edit book" aria-label="Edit ${escapeHtml(book.title)}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>
                            </svg>
                        </button>
                        <button type="button" class="action-btn delete" data-action="delete"
                                data-id="${book.id}" title="Delete book" aria-label="Delete ${escapeHtml(book.title)}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                <path d="M10 11v6M14 11v6"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    els.bookGrid.innerHTML = books.map(book => {
        const quantity = Number(book.quantity);
        const qtyClass = quantity === 0 ? "qty-out" : quantity <= 2 ? "qty-low" : "";
        const qtyText = quantity === 0 ? "Out of stock" : `${quantity} in stock`;

        return `
            <article class="book-card">
                <div class="book-card-top">
                    <span class="cell-id">#${book.id}</span>
                    <span class="category-chip">${escapeHtml(book.category)}</span>
                </div>
                <h3>${escapeHtml(book.title)}</h3>
                <p class="book-card-author">by ${escapeHtml(book.author)}</p>
                <div class="book-card-bottom">
                    <span class="qty-badge ${qtyClass}">
                        <span class="qty-dot"></span>${qtyText}
                    </span>
                    <div class="row-actions">
                        <button type="button" class="action-btn edit" data-action="edit"
                                data-id="${book.id}" title="Edit book" aria-label="Edit ${escapeHtml(book.title)}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>
                            </svg>
                        </button>
                        <button type="button" class="action-btn delete" data-action="delete"
                                data-id="${book.id}" title="Delete book" aria-label="Delete ${escapeHtml(book.title)}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                <path d="M10 11v6M14 11v6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    const hasFilters = state.searchTerm || state.categoryFilter;
    els.resultCount.textContent = hasFilters
        ? `${books.length} ${books.length === 1 ? "book" : "books"} match current filters`
        : `${books.length} ${books.length === 1 ? "book" : "books"} in the library`;
}

/** Shows exactly one of: loading, table, empty, error. */
function showState(which) {
    els.loadingState.hidden = which !== "loading";
    els.emptyState.hidden = which !== "empty";
    els.errorState.hidden = which !== "error";
    els.bookTable.hidden = which !== "table" || state.view !== "list";
    els.bookGrid.hidden = which !== "table" || state.view !== "grid";

    if (which === "empty") {
        if (state.searchTerm || state.categoryFilter) {
            els.emptyTitle.textContent = "No matching books";
            els.emptyText.textContent = "No books match the current search and category filters. Try changing your filters.";
        } else {
            els.emptyTitle.textContent = "No books yet";
            els.emptyText.textContent =
                'Click "Add Book" to add your first book to the library.';
        }
    }
}

/* ============================================================
   Add / Edit modal
   ============================================================ */

function openBookModal(book = null) {
    state.editingId = book ? book.id : null;

    els.modalTitle.textContent = book ? "Edit Book" : "Add New Book";
    els.modalSubtitle.textContent = book
        ? "Update the details below and save your changes."
        : "Enter the details of the book below.";
    els.saveBtnText.textContent = book ? "Update Book" : "Save Book";

    els.title.value = book ? book.title : "";
    els.author.value = book ? book.author : "";
    els.category.value = book ? book.category : "";
    els.quantity.value = book ? book.quantity : "";

    clearFormErrors();
    els.bookModal.hidden = false;
    document.body.classList.add("modal-open");
    els.title.focus();
}

function closeBookModal() {
    els.bookModal.hidden = true;
    state.editingId = null;
    document.body.classList.remove("modal-open");
    els.bookForm.reset();
    clearFormErrors();
}

function clearFormErrors() {
    ["title", "author", "category", "quantity"].forEach(field => {
        els[field].classList.remove("invalid");
        document.getElementById(`${field}Error`).textContent = "";
    });
}

function setFieldError(field, message) {
    els[field].classList.add("invalid");
    document.getElementById(`${field}Error`).textContent = message;
}

/** Client-side validation. Returns true when the form is valid. */
function validateForm() {
    clearFormErrors();
    let valid = true;

    const title = els.title.value.trim();
    const author = els.author.value.trim();
    const category = els.category.value.trim();
    const quantityRaw = els.quantity.value.trim();

    if (!title) {
        setFieldError("title", "Title is required.");
        valid = false;
    } else if (title.length > 150) {
        setFieldError("title", "Title must be at most 150 characters.");
        valid = false;
    }

    if (!author) {
        setFieldError("author", "Author is required.");
        valid = false;
    } else if (author.length > 100) {
        setFieldError("author", "Author must be at most 100 characters.");
        valid = false;
    }

    if (!category) {
        setFieldError("category", "Category is required.");
        valid = false;
    } else if (category.length > 80) {
        setFieldError("category", "Category must be at most 80 characters.");
        valid = false;
    }

    if (quantityRaw === "") {
        setFieldError("quantity", "Quantity is required.");
        valid = false;
    } else {
        const quantity = Number(quantityRaw);
        if (!Number.isInteger(quantity)) {
            setFieldError("quantity", "Quantity must be a whole number.");
            valid = false;
        } else if (quantity < 0) {
            setFieldError("quantity", "Quantity cannot be negative.");
            valid = false;
        }
    }

    return valid;
}

async function saveBook(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
        title: els.title.value.trim(),
        author: els.author.value.trim(),
        category: els.category.value.trim(),
        quantity: Number(els.quantity.value)
    };

    const isEditing = state.editingId !== null;
    setSaving(true);

    try {
        await apiRequest(isEditing ? `/${state.editingId}` : "", {
            method: isEditing ? "PUT" : "POST",
            body: JSON.stringify(payload)
        });

        closeBookModal();
        showToast(isEditing ? "Book updated successfully." : "Book added successfully.");
        await refreshData();
    } catch (error) {
        // Show server-side field errors next to the inputs.
        Object.entries(error.fieldErrors || {}).forEach(([field, message]) => {
            if (els[field]) setFieldError(field, message);
        });
        showToast(error.message, "error");
    } finally {
        setSaving(false);
    }
}

function setSaving(saving) {
    els.saveBtn.disabled = saving;
    els.saveBtnText.textContent = saving
        ? "Saving..."
        : (state.editingId !== null ? "Update Book" : "Save Book");
}

/* ============================================================
   Delete flow
   ============================================================ */

function openDeleteModal(book) {
    state.deletingId = book.id;
    els.deleteBookName.textContent = `"${book.title}"`;
    els.deleteModal.hidden = false;
    document.body.classList.add("modal-open");
    els.confirmDeleteBtn.focus();
}

function closeDeleteModal() {
    els.deleteModal.hidden = true;
    state.deletingId = null;
    document.body.classList.remove("modal-open");
}

async function confirmDelete() {
    if (state.deletingId === null) return;

    const id = state.deletingId;
    els.confirmDeleteBtn.disabled = true;
    els.confirmDeleteBtn.textContent = "Deleting...";

    try {
        await apiRequest(`/${id}`, { method: "DELETE" });
        closeDeleteModal();
        showToast("Book deleted successfully.");
        await refreshData();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        els.confirmDeleteBtn.disabled = false;
        els.confirmDeleteBtn.textContent = "Delete Book";
    }
}

/* ============================================================
   Search
   ============================================================ */

let searchTimer = null;

function onSearchInput() {
    const value = els.searchInput.value.trim();
    els.clearSearch.hidden = value === "";

    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        state.searchTerm = value;
        updateCatalog();
    }, 300);
}

function clearSearch() {
    els.searchInput.value = "";
    els.clearSearch.hidden = true;
    state.searchTerm = "";
    updateCatalog();
    els.searchInput.focus();
}

/* ============================================================
   Utilities
   ============================================================ */

/** Prevents user-entered text from being treated as HTML. */
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === "success" ? "✓" : "!"}</span>
        <span>${escapeHtml(message)}</span>
    `;
    els.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, 3200);
}

async function refreshData() {
    await Promise.all([loadBooks(), loadTotalCount()]);
}

async function loadStudents() {
    setStudentState("loading");

    try {
        state.students = await studentApiRequest();
        state.studentsLoaded = true;
        renderStudents();
    } catch (error) {
        els.studentErrorText.textContent = error.message;
        setStudentState("error");
    }
}

function renderStudents() {
    const searchTerm = state.studentSearchTerm.toLocaleLowerCase();
    const students = state.students
        .filter(student =>
            student.studentId.toLocaleLowerCase().includes(searchTerm) ||
            student.name.toLocaleLowerCase().includes(searchTerm)
        )
        .sort((first, second) => first.name.localeCompare(second.name));

    els.studentTableBody.innerHTML = students.map(student => `
        <tr>
            <td><span class="student-id-chip">${escapeHtml(student.studentId)}</span></td>
            <td class="student-name-cell">${escapeHtml(student.name)}</td>
            <td>
                <div class="row-actions">
                    <button type="button" class="action-btn edit" data-student-action="edit"
                            data-id="${student.id}" title="Edit student" aria-label="Edit ${escapeHtml(student.name)}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>
                        </svg>
                    </button>
                    <button type="button" class="action-btn delete" data-student-action="delete"
                            data-id="${student.id}" title="Delete student" aria-label="Delete ${escapeHtml(student.name)}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6M14 11v6"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    const noun = students.length === 1 ? "student" : "students";
    els.studentResultCount.textContent = state.studentSearchTerm
        ? `${students.length} ${noun} found`
        : `${students.length} ${noun} registered`;

    if (students.length) {
        setStudentState("table");
    } else {
        els.studentEmptyTitle.textContent = state.studentSearchTerm ? "No matching students" : "No students yet";
        els.studentEmptyText.textContent = state.studentSearchTerm
            ? "Try a different student ID or name."
            : "Add a student to start building the student directory.";
        setStudentState("empty");
    }

    if (state.activeSection === "students" && els.headerStatLabel) {
        els.headerStatLabel.textContent = "Students";
        els.totalCount.textContent = state.students.length;
    }
}

function setStudentState(which) {
    els.studentLoadingState.hidden = which !== "loading";
    els.studentEmptyState.hidden = which !== "empty";
    els.studentErrorState.hidden = which !== "error";
    els.studentTable.hidden = which !== "table";
}

function selectSection(section) {
    state.activeSection = section;
    const showBooks = section === "books";
    const showStudents = section === "students";
    const showIssues = section === "issues";
    els.booksSection.hidden = !showBooks;
    els.studentsSection.hidden = !showStudents;
    els.issuesSection.hidden = !showIssues;
    els.booksNavBtn.classList.toggle("is-active", showBooks);
    els.studentsNavBtn.classList.toggle("is-active", showStudents);
    els.issuesNavBtn.classList.toggle("is-active", showIssues);
    els.booksNavBtn.toggleAttribute("aria-current", showBooks);
    els.studentsNavBtn.toggleAttribute("aria-current", showStudents);
    els.issuesNavBtn.toggleAttribute("aria-current", showIssues);
    els.workspaceTitle.textContent = showBooks
        ? "Books overview"
        : showStudents ? "Student directory" : "Issue transactions";

    if (showStudents) {
        els.headerStatLabel.textContent = "Students";
        els.totalCount.textContent = state.studentsLoaded ? state.students.length : "—";
        if (state.studentsLoaded) {
            renderStudents();
        } else {
            loadStudents();
        }
    } else if (showBooks) {
        els.headerStatLabel.textContent = "Total Books";
        els.totalCount.textContent = "—";
        loadTotalCount();
    } else {
        els.headerStatLabel.textContent = "Active Issues";
        els.totalCount.textContent = state.issuesLoaded
            ? state.issues.filter(issue => !issue.returnDate).length
            : "—";
        if (state.issuesLoaded) {
            renderIssues();
        } else {
            loadIssues();
        }
    }
}

function openStudentModal(student = null) {
    state.editingStudentId = student ? student.id : null;
    els.studentModalTitle.textContent = student ? "Edit Student" : "Add Student";
    els.studentModalSubtitle.textContent = student
        ? "Update the student details below."
        : "Enter the student's details.";
    els.saveStudentBtnText.textContent = student ? "Update Student" : "Save Student";
    els.studentId.value = student ? student.studentId : "";
    els.studentName.value = student ? student.name : "";
    clearStudentErrors();
    els.studentModal.hidden = false;
    document.body.classList.add("modal-open");
    els.studentId.focus();
}

function closeStudentModal() {
    els.studentModal.hidden = true;
    state.editingStudentId = null;
    document.body.classList.remove("modal-open");
    els.studentForm.reset();
    clearStudentErrors();
}

function clearStudentErrors() {
    els.studentId.classList.remove("invalid");
    els.studentName.classList.remove("invalid");
    document.getElementById("studentIdError").textContent = "";
    document.getElementById("studentNameError").textContent = "";
}

function setStudentFieldError(field, message) {
    const input = field === "studentId" ? els.studentId : els.studentName;
    const error = document.getElementById(field === "studentId" ? "studentIdError" : "studentNameError");
    input.classList.add("invalid");
    error.textContent = message;
}

function validateStudentForm() {
    clearStudentErrors();
    let valid = true;
    const studentId = els.studentId.value.trim();
    const name = els.studentName.value.trim();

    if (!studentId) {
        setStudentFieldError("studentId", "Student ID is required.");
        valid = false;
    } else if (studentId.length > 30) {
        setStudentFieldError("studentId", "Student ID must be at most 30 characters.");
        valid = false;
    }

    if (!name) {
        setStudentFieldError("name", "Name is required.");
        valid = false;
    } else if (name.length > 100) {
        setStudentFieldError("name", "Name must be at most 100 characters.");
        valid = false;
    }

    return valid;
}

async function saveStudent(event) {
    event.preventDefault();
    if (!validateStudentForm()) return;

    const isEditing = state.editingStudentId !== null;
    const payload = {
        studentId: els.studentId.value.trim(),
        name: els.studentName.value.trim()
    };
    els.saveStudentBtn.disabled = true;
    els.saveStudentBtnText.textContent = isEditing ? "Updating..." : "Saving...";

    try {
        const path = isEditing ? `/${state.editingStudentId}` : "";
        await studentApiRequest(path, {
            method: isEditing ? "PUT" : "POST",
            body: JSON.stringify(payload)
        });
        closeStudentModal();
        showToast(isEditing ? "Student updated successfully." : "Student added successfully.");
        await loadStudents();
    } catch (error) {
        Object.entries(error.fieldErrors || {}).forEach(([field, message]) => {
            if (field === "studentId" || field === "name") setStudentFieldError(field, message);
        });
        if (error.status === 409) {
            setStudentFieldError("studentId", error.message);
        }
        showToast(error.message, "error");
    } finally {
        els.saveStudentBtn.disabled = false;
        els.saveStudentBtnText.textContent = state.editingStudentId !== null ? "Update Student" : "Save Student";
    }
}

function openStudentDeleteModal(student) {
    state.deletingStudentId = student.id;
    els.deleteStudentName.textContent = `"${student.name}" (${student.studentId})`;
    els.deleteStudentModal.hidden = false;
    document.body.classList.add("modal-open");
    els.confirmStudentDeleteBtn.focus();
}

function closeStudentDeleteModal() {
    els.deleteStudentModal.hidden = true;
    state.deletingStudentId = null;
    document.body.classList.remove("modal-open");
}

async function confirmStudentDelete() {
    if (state.deletingStudentId === null) return;

    const id = state.deletingStudentId;
    els.confirmStudentDeleteBtn.disabled = true;
    els.confirmStudentDeleteBtn.textContent = "Deleting...";
    try {
        await studentApiRequest(`/${id}`, { method: "DELETE" });
        closeStudentDeleteModal();
        showToast("Student deleted successfully.");
        await loadStudents();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        els.confirmStudentDeleteBtn.disabled = false;
        els.confirmStudentDeleteBtn.textContent = "Delete Student";
    }
}

async function loadIssues() {
    setIssueState("loading");

    try {
        state.issues = await issueApiRequest();
        state.issuesLoaded = true;
        renderIssues();
    } catch (error) {
        els.issueErrorText.textContent = error.message;
        setIssueState("error");
    }
}

function setIssueState(which) {
    els.issueLoadingState.hidden = which !== "loading";
    els.issueEmptyState.hidden = which !== "empty";
    els.issueErrorState.hidden = which !== "error";
    els.issueTable.hidden = which !== "table";
}

function renderIssues() {
    const searchTerm = state.issueSearchTerm.toLocaleLowerCase();
    const issues = state.issues.filter(issue => {
        const searchable = [
            issue.book.title,
            issue.book.author,
            issue.student.name,
            issue.student.studentId
        ].join(" ").toLocaleLowerCase();
        return searchable.includes(searchTerm);
    });
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    els.issueTableBody.innerHTML = issues.map(issue => {
        let status;
        let statusClass;
        if (issue.returnDate) {
            status = "Returned";
            statusClass = "issue-status-returned";
        } else if (issue.dueDate < todayString) {
            status = "Overdue";
            statusClass = "issue-status-overdue";
        } else if (issue.dueDate === todayString) {
            status = "Due today";
            statusClass = "issue-status-due";
        } else {
            status = "On loan";
            statusClass = "issue-status-active";
        }

        return `
            <tr>
                <td>
                    <strong>${escapeHtml(issue.student.name)}</strong>
                    <span class="issue-secondary">${escapeHtml(issue.student.studentId)}</span>
                </td>
                <td>
                    <strong>${escapeHtml(issue.book.title)}</strong>
                    <span class="issue-secondary">${escapeHtml(issue.book.author)}</span>
                </td>
                <td>${escapeHtml(issue.issueDate)}</td>
                <td>${escapeHtml(issue.dueDate)}</td>
                <td><span class="issue-status ${statusClass}">${status}</span></td>
                <td>
                    ${issue.returnDate
                        ? `<span class="issue-return-date">Returned ${escapeHtml(issue.returnDate)}</span>`
                        : `<button type="button" class="btn btn-secondary btn-return-book"
                                   data-issue-action="return" data-id="${issue.id}">Return</button>`}
                </td>
            </tr>
        `;
    }).join("");

    const activeCount = state.issues.filter(issue => !issue.returnDate).length;
    els.issueResultCount.textContent = state.issueSearchTerm
        ? `${issues.length} ${issues.length === 1 ? "transaction" : "transactions"} found`
        : `${activeCount} active · ${state.issues.length} total`;

    if (state.activeSection === "issues") {
        els.totalCount.textContent = activeCount;
    }

    if (issues.length) {
        setIssueState("table");
    } else {
        els.issueEmptyTitle.textContent = state.issueSearchTerm
            ? "No matching transactions"
            : "No issue transactions";
        els.issueEmptyText.textContent = state.issueSearchTerm
            ? "Try a different book title, student name, or student ID."
            : "Issue a book to a registered student to see it here.";
        setIssueState("empty");
    }
}

async function openIssueModal() {
    els.confirmIssueBtn.disabled = true;
    els.issueFormHint.textContent = "Loading students and available books...";
    els.issueFormHint.classList.remove("issue-form-error");

    try {
        const [books, students] = await Promise.all([apiRequest(), studentApiRequest()]);
        const availableBooks = books.filter(book => Number(book.quantity) > 0);
        state.allBooks = books;
        state.students = students;
        state.studentsLoaded = true;

        els.issueStudentSelect.innerHTML = '<option value="">Select a student</option>' +
            students.map(student =>
                `<option value="${student.id}">${escapeHtml(student.studentId)} — ${escapeHtml(student.name)}</option>`
            ).join("");
        els.issueBookSelect.innerHTML = '<option value="">Select a book</option>' +
            availableBooks.map(book =>
                `<option value="${book.id}">${escapeHtml(book.title)} — ${Number(book.quantity)} available</option>`
            ).join("");

        if (!students.length) {
            els.issueFormHint.textContent = "Add a student before issuing a book.";
            els.issueFormHint.classList.add("issue-form-error");
        } else if (!availableBooks.length) {
            els.issueFormHint.textContent = "There are no books currently in stock.";
            els.issueFormHint.classList.add("issue-form-error");
        } else {
            els.issueFormHint.textContent = "Only books with available copies can be issued.";
        }

        els.confirmIssueBtn.disabled = !students.length || !availableBooks.length;
        els.issueModal.hidden = false;
        document.body.classList.add("modal-open");
        els.issueStudentSelect.focus();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function closeIssueModal() {
    els.issueModal.hidden = true;
    document.body.classList.remove("modal-open");
    els.issueForm.reset();
    els.issueFormHint.textContent = "";
    els.issueFormHint.classList.remove("issue-form-error");
}

async function submitIssue(event) {
    event.preventDefault();
    if (!els.issueForm.reportValidity()) return;

    els.confirmIssueBtn.disabled = true;
    els.confirmIssueBtnText.textContent = "Issuing...";
    try {
        await issueApiRequest("", {
            method: "POST",
            body: JSON.stringify({
                bookId: Number(els.issueBookSelect.value),
                studentId: Number(els.issueStudentSelect.value)
            })
        });
        closeIssueModal();
        showToast("Book issued successfully. It is due in 14 days.");
        await Promise.all([loadIssues(), refreshData()]);
    } catch (error) {
        els.issueFormHint.textContent = error.message;
        els.issueFormHint.classList.add("issue-form-error");
        showToast(error.message, "error");
    } finally {
        els.confirmIssueBtn.disabled = false;
        els.confirmIssueBtnText.textContent = "Confirm Issue";
    }
}

async function returnIssuedBook(id, button) {
    button.disabled = true;
    button.textContent = "Returning...";
    try {
        await issueApiRequest(`/${id}/return`, { method: "PUT" });
        showToast("Book returned successfully.");
        await Promise.all([loadIssues(), refreshData()]);
    } catch (error) {
        showToast(error.message, "error");
        button.disabled = false;
        button.textContent = "Return";
    }
}

/* ============================================================
   Event listeners
   ============================================================ */

els.booksNavBtn.addEventListener("click", () => selectSection("books"));
els.studentsNavBtn.addEventListener("click", () => selectSection("students"));
els.issuesNavBtn.addEventListener("click", () => selectSection("issues"));
els.addBookBtn.addEventListener("click", () => openBookModal());
els.closeModalBtn.addEventListener("click", closeBookModal);
els.cancelBtn.addEventListener("click", closeBookModal);
els.bookForm.addEventListener("submit", saveBook);

els.searchInput.addEventListener("input", onSearchInput);
els.clearSearch.addEventListener("click", clearSearch);
els.categoryFilter.addEventListener("change", () => {
    state.categoryFilter = els.categoryFilter.value;
    updateCatalog();
});
els.sortBooks.addEventListener("change", () => {
    state.sortBy = els.sortBooks.value;
    updateCatalog();
});

els.listViewBtn.addEventListener("click", () => {
    state.view = "list";
    els.listViewBtn.classList.add("is-active");
    els.gridViewBtn.classList.remove("is-active");
    els.listViewBtn.setAttribute("aria-pressed", "true");
    els.gridViewBtn.setAttribute("aria-pressed", "false");
    updateCatalog();
});
els.gridViewBtn.addEventListener("click", () => {
    state.view = "grid";
    els.gridViewBtn.classList.add("is-active");
    els.listViewBtn.classList.remove("is-active");
    els.gridViewBtn.setAttribute("aria-pressed", "true");
    els.listViewBtn.setAttribute("aria-pressed", "false");
    updateCatalog();
});

els.retryBtn.addEventListener("click", refreshData);
els.retryStudentsBtn.addEventListener("click", loadStudents);
els.retryIssuesBtn.addEventListener("click", loadIssues);
els.addStudentBtn.addEventListener("click", () => openStudentModal());
els.closeStudentModalBtn.addEventListener("click", closeStudentModal);
els.cancelStudentBtn.addEventListener("click", closeStudentModal);
els.studentForm.addEventListener("submit", saveStudent);
els.studentSearchInput.addEventListener("input", () => {
    state.studentSearchTerm = els.studentSearchInput.value.trim();
    renderStudents();
});
els.cancelStudentDeleteBtn.addEventListener("click", closeStudentDeleteModal);
els.confirmStudentDeleteBtn.addEventListener("click", confirmStudentDelete);
els.newIssueBtn.addEventListener("click", openIssueModal);
els.closeIssueModalBtn.addEventListener("click", closeIssueModal);
els.cancelIssueBtn.addEventListener("click", closeIssueModal);
els.issueForm.addEventListener("submit", submitIssue);
els.issueSearchInput.addEventListener("input", () => {
    state.issueSearchTerm = els.issueSearchInput.value.trim();
    renderIssues();
});
els.issueTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-issue-action='return']");
    if (button) returnIssuedBook(Number(button.dataset.id), button);
});
els.studentTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-student-action]");
    if (!button) return;

    const student = state.students.find(item => item.id === Number(button.dataset.id));
    if (!student) return;

    if (button.dataset.studentAction === "edit") {
        openStudentModal(student);
    } else {
        openStudentDeleteModal(student);
    }
});

// Edit / delete buttons inside either catalog view (event delegation)
function handleBookAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const book = state.books.find(item => item.id === id);
    if (!book) return;

    if (button.dataset.action === "edit") {
        openBookModal(book);
    } else {
        openDeleteModal(book);
    }
}

els.tableBody.addEventListener("click", handleBookAction);
els.bookGrid.addEventListener("click", handleBookAction);

els.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
els.confirmDeleteBtn.addEventListener("click", confirmDelete);

// Clicking the dark overlay (but not the modal itself) closes it
[els.bookModal, els.deleteModal, els.studentModal, els.deleteStudentModal, els.issueModal].forEach(overlay => {
    overlay.addEventListener("mousedown", event => {
        if (event.target === overlay) {
            if (overlay === els.bookModal) closeBookModal();
            else if (overlay === els.deleteModal) closeDeleteModal();
            else if (overlay === els.studentModal) closeStudentModal();
            else if (overlay === els.deleteStudentModal) closeStudentDeleteModal();
            else closeIssueModal();
        }
    });
});

// Escape closes the open modal
document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!els.bookModal.hidden) closeBookModal();
    else if (!els.deleteModal.hidden) closeDeleteModal();
    else if (!els.studentModal.hidden) closeStudentModal();
    else if (!els.deleteStudentModal.hidden) closeStudentDeleteModal();
    else if (!els.issueModal.hidden) closeIssueModal();
});

/* ============================================================
   Initial load
   ============================================================ */
refreshData();
