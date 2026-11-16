package com.college.library.service;

import com.college.library.exception.ResourceNotFoundException;
import com.college.library.exception.ResourceConflictException;
import com.college.library.model.Book;
import com.college.library.repository.BookRepository;
import com.college.library.repository.IssueTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer: contains the business logic of the application.
 */
@Service
@Transactional
public class BookService {

    private final BookRepository bookRepository;
    private final IssueTransactionRepository issueRepository;

    public BookService(BookRepository bookRepository, IssueTransactionRepository issueRepository) {
        this.bookRepository = bookRepository;
        this.issueRepository = issueRepository;
    }

    /** 1. Add a new book */
    public Book addBook(Book book) {
        book.setId(null); // force INSERT instead of UPDATE
        return bookRepository.save(book);
    }

    /** 2. View all books */
    @Transactional(readOnly = true)
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    /** Find one book by id, or throw a 404 error */
    @Transactional(readOnly = true)
    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id " + id));
    }

    /** 3. Update book details */
    public Book updateBook(Long id, Book updatedBook) {
        Book existing = getBookById(id);
        existing.setTitle(updatedBook.getTitle());
        existing.setAuthor(updatedBook.getAuthor());
        existing.setCategory(updatedBook.getCategory());
        existing.setQuantity(updatedBook.getQuantity());
        return bookRepository.save(existing);
    }

    /** 4. Delete a book */
    public void deleteBook(Long id) {
        Book existing = getBookById(id);
        if (issueRepository.existsByBook_Id(id)) {
            throw new ResourceConflictException("This book has issue history and cannot be deleted");
        }
        bookRepository.delete(existing);
    }

    /** 5. Search books by title or author */
    @Transactional(readOnly = true)
    public List<Book> searchBooks(String keyword) {
        String value = keyword == null ? "" : keyword.trim();
        return bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(value, value);
    }

    /** 6. Total number of books (sum of all quantities) */
    @Transactional(readOnly = true)
    public long getTotalBookCount() {
        return bookRepository.count();
    }
}
