package com.college.library.repository;

import com.college.library.model.IssueTransaction;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueTransactionRepository extends JpaRepository<IssueTransaction, Long> {

    @EntityGraph(attributePaths = {"book", "student"})
    List<IssueTransaction> findAllByOrderByIssueDateDescIdDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select issue from IssueTransaction issue join fetch issue.book join fetch issue.student where issue.id = :id")
    Optional<IssueTransaction> findByIdForUpdate(@Param("id") Long id);

    boolean existsByBook_Id(Long bookId);

    boolean existsByStudent_Id(Long studentId);
}
