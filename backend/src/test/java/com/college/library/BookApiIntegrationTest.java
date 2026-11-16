package com.college.library;

import com.college.library.model.Book;
import com.college.library.repository.BookRepository;
import com.college.library.repository.IssueTransactionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end API tests for all CRUD operations, search, count and validation.
 * These tests use H2 (test profile), so MySQL does not need to be running.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private IssueTransactionRepository issueRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void cleanDatabase() {
        issueRepository.deleteAll();
        bookRepository.deleteAll();
    }

    private Book sampleBook(String title, String author, String category, int quantity) {
        return new Book(title, author, category, quantity);
    }

    @Test
    void shouldCreateAndReadBook() throws Exception {
        Book book = sampleBook("Effective Java", "Joshua Bloch", "Programming", 5);

        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(book)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title", is("Effective Java")))
                .andExpect(jsonPath("$.author", is("Joshua Bloch")));

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].quantity", is(5)));
    }

    @Test
    void shouldUpdateBook() throws Exception {
        Book saved = bookRepository.save(sampleBook("Old Title", "Old Author", "Fiction", 2));

        Book update = sampleBook("New Title", "New Author", "Science", 9);

        mockMvc.perform(put("/api/books/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("New Title")))
                .andExpect(jsonPath("$.author", is("New Author")))
                .andExpect(jsonPath("$.category", is("Science")))
                .andExpect(jsonPath("$.quantity", is(9)));
    }

    @Test
    void shouldDeleteBook() throws Exception {
        Book saved = bookRepository.save(sampleBook("Delete Me", "Someone", "Fiction", 1));

        mockMvc.perform(delete("/api/books/" + saved.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/books/" + saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldSearchByTitleOrAuthor() throws Exception {
        bookRepository.save(sampleBook("Java Basics", "Ravi Kumar", "Programming", 3));
        bookRepository.save(sampleBook("Clean Code", "Robert Martin", "Programming", 2));
        bookRepository.save(sampleBook("Java in Depth", "Anita Sharma", "Programming", 4));

        // search by title
        mockMvc.perform(get("/api/books/search").param("keyword", "java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        // search by author
        mockMvc.perform(get("/api/books/search").param("keyword", "martin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Clean Code")));
    }

    @Test
    void shouldReturnTotalCount() throws Exception {
        bookRepository.save(sampleBook("Book One", "Author One", "Fiction", 1));
        bookRepository.save(sampleBook("Book Two", "Author Two", "Fiction", 1));

        mockMvc.perform(get("/api/books/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(2)));
    }

    @Test
    void shouldRejectInvalidBook() throws Exception {
        Book invalid = new Book("", "", "", -1);

        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.author").exists())
                .andExpect(jsonPath("$.errors.category").exists())
                .andExpect(jsonPath("$.errors.quantity").exists());
    }

    @Test
    void shouldReturn404ForMissingBook() throws Exception {
        mockMvc.perform(get("/api/books/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }
}
