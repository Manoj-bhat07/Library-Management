package com.college.library;

import com.college.library.model.Student;
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
class StudentApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private IssueTransactionRepository issueRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void cleanStudents() {
        issueRepository.deleteAll();
        studentRepository.deleteAll();
    }

    @Test
    void shouldCreateAndListStudents() throws Exception {
        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Student("STU-001", "Asha Rao"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.studentId", is("STU-001")))
                .andExpect(jsonPath("$.name", is("Asha Rao")));

        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void shouldUpdateStudent() throws Exception {
        Student saved = studentRepository.save(new Student("STU-001", "Old Name"));

        mockMvc.perform(put("/api/students/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Student("STU-002", "New Name"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId", is("STU-002")))
                .andExpect(jsonPath("$.name", is("New Name")));
    }

    @Test
    void shouldDeleteStudent() throws Exception {
        Student saved = studentRepository.save(new Student("STU-001", "Asha Rao"));

        mockMvc.perform(delete("/api/students/" + saved.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/students/" + saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectDuplicateStudentIdIgnoringCase() throws Exception {
        studentRepository.save(new Student("STU-001", "Asha Rao"));

        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Student("stu-001", "Another Student"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void shouldRejectInvalidStudent() throws Exception {
        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Student(" ", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.studentId").exists())
                .andExpect(jsonPath("$.errors.name").exists());
    }
}
