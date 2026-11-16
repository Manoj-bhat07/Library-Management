package com.college.library.repository;

import com.college.library.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByStudentIdIgnoreCase(String studentId);

    boolean existsByStudentIdIgnoreCaseAndIdNot(String studentId, Long id);
}
