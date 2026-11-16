package com.college.library.service;

import com.college.library.exception.DuplicateStudentIdException;
import com.college.library.exception.ResourceNotFoundException;
import com.college.library.exception.ResourceConflictException;
import com.college.library.model.Student;
import com.college.library.repository.IssueTransactionRepository;
import com.college.library.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final IssueTransactionRepository issueRepository;

    public StudentService(StudentRepository studentRepository, IssueTransactionRepository issueRepository) {
        this.studentRepository = studentRepository;
        this.issueRepository = issueRepository;
    }

    public Student addStudent(Student student) {
        student.setId(null);
        student.setStudentId(student.getStudentId().trim());
        student.setName(student.getName().trim());
        ensureStudentIdIsAvailable(student.getStudentId(), null);
        return studentRepository.save(student);
    }

    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));
    }

    public Student updateStudent(Long id, Student updatedStudent) {
        Student existing = getStudentById(id);
        String studentId = updatedStudent.getStudentId().trim();
        ensureStudentIdIsAvailable(studentId, id);
        existing.setStudentId(studentId);
        existing.setName(updatedStudent.getName().trim());
        return studentRepository.save(existing);
    }

    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        if (issueRepository.existsByStudent_Id(id)) {
            throw new ResourceConflictException("This student has issue history and cannot be deleted");
        }
        studentRepository.delete(student);
    }

    private void ensureStudentIdIsAvailable(String studentId, Long currentId) {
        boolean alreadyExists = currentId == null
                ? studentRepository.existsByStudentIdIgnoreCase(studentId)
                : studentRepository.existsByStudentIdIgnoreCaseAndIdNot(studentId, currentId);
        if (alreadyExists) {
            throw new DuplicateStudentIdException(studentId);
        }
    }
}
