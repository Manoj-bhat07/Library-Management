package com.college.library.service;

import com.college.library.exception.ResourceConflictException;
import com.college.library.exception.ResourceNotFoundException;
import com.college.library.model.Book;
import com.college.library.model.IssueTransaction;
import com.college.library.model.Student;
import com.college.library.repository.BookRepository;
import com.college.library.repository.IssueTransactionRepository;
import com.college.library.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class IssueTransactionService {

    private static final long LOAN_PERIOD_DAYS = 14;

    private final IssueTransactionRepository issueRepository;
    private final BookRepository bookRepository;
    private final StudentRepository studentRepository;

    public IssueTransactionService(IssueTransactionRepository issueRepository,
                                   BookRepository bookRepository,
                                   StudentRepository studentRepository) {
        this.issueRepository = issueRepository;
        this.bookRepository = bookRepository;
        this.studentRepository = studentRepository;
    }

    public IssueTransaction issueBook(Long bookId, Long studentId) {
        Book book = bookRepository.findByIdForUpdate(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id " + bookId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + studentId));

        if (book.getQuantity() <= 0) {
            throw new ResourceConflictException("This book is out of stock");
        }

        book.setQuantity(book.getQuantity() - 1);
        LocalDate issueDate = LocalDate.now();
        return issueRepository.save(new IssueTransaction(
                book, student, issueDate, issueDate.plusDays(LOAN_PERIOD_DAYS)));
    }

    @Transactional(readOnly = true)
    public List<IssueTransaction> getAllIssues() {
        return issueRepository.findAllByOrderByIssueDateDescIdDesc();
    }

    public IssueTransaction returnBook(Long id) {
        IssueTransaction issue = issueRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue transaction not found with id " + id));

        if (issue.getReturnDate() != null) {
            throw new ResourceConflictException("This book has already been returned");
        }

        Book book = bookRepository.findByIdForUpdate(issue.getBook().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found for this issue transaction"));
        book.setQuantity(book.getQuantity() + 1);
        issue.setReturnDate(LocalDate.now());
        return issue;
    }
}
