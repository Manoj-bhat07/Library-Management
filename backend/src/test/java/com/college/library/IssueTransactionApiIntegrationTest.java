package com.college.library;

import com.college.library.model.Book;
import com.college.library.model.Student;
import com.college.library.repository.BookRepository;
import com.college.library.repository.IssueTransactionRepository;
import com.college.library.repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IssueTransactionApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private IssueTransactionRepository issueRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Book book;
    private Student student;

    @BeforeEach
    void setUp() {
        issueRepository.deleteAll();
        studentRepository.deleteAll();
        bookRepository.deleteAll();
        book = bookRepository.save(new Book("Effective Java", "Joshua Bloch", "Programming", 2));
        student = studentRepository.save(new Student("STU-001", "Asha Rao"));
    }

    @Test
    void shouldIssueBookAndReduceAvailableQuantity() throws Exception {
        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "bookId", book.getId(),
                                "studentId", student.getId()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.book.id", is(book.getId().intValue())))
                .andExpect(jsonPath("$.student.studentId", is("STU-001")))
                .andExpect(jsonPath("$.issueDate", is(LocalDate.now().toString())))
                .andExpect(jsonPath("$.dueDate", is(LocalDate.now().plusDays(14).toString())))
                .andExpect(jsonPath("$.returnDate").doesNotExist());

        mockMvc.perform(get("/api/books/" + book.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity", is(1)));
        mockMvc.perform(get("/api/issues"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void shouldRejectIssueWhenBookIsOutOfStock() throws Exception {
        book.setQuantity(0);
        bookRepository.save(book);

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "bookId", book.getId(),
                                "studentId", student.getId()))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("This book is out of stock")));

        mockMvc.perform(get("/api/issues"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void shouldReturnBookAndRestoreAvailabilityOnlyOnce() throws Exception {
        String response = mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "bookId", book.getId(),
                                "studentId", student.getId()))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long issueId = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(put("/api/issues/" + issueId + "/return"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.returnDate", is(LocalDate.now().toString())));
        mockMvc.perform(get("/api/books/" + book.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity", is(2)));
        mockMvc.perform(put("/api/issues/" + issueId + "/return"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("This book has already been returned")));
        mockMvc.perform(get("/api/books/" + book.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity", is(2)));
    }

    @Test
    void shouldPreserveIssueHistoryWhenDeletingLinkedRecords() throws Exception {
        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "bookId", book.getId(),
                                "studentId", student.getId()))))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/books/" + book.getId()))
                .andExpect(status().isConflict());
        mockMvc.perform(delete("/api/students/" + student.getId()))
                .andExpect(status().isConflict());
    }
}
