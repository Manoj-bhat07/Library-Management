package com.college.library.controller;

import com.college.library.model.IssueTransaction;
import com.college.library.service.IssueTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueTransactionController {

    private final IssueTransactionService issueService;

    public IssueTransactionController(IssueTransactionService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public List<IssueTransaction> getAllIssues() {
        return issueService.getAllIssues();
    }

    @PostMapping
    public ResponseEntity<IssueTransaction> issueBook(@Valid @RequestBody IssueRequest request) {
        IssueTransaction issue = issueService.issueBook(request.bookId(), request.studentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(issue);
    }

    @PutMapping("/{id}/return")
    public IssueTransaction returnBook(@PathVariable Long id) {
        return issueService.returnBook(id);
    }
}
