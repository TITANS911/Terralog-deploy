package com.terralog.repository;

import com.terralog.model.userModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface userRepository extends JpaRepository<userModel, Long> {

    // Spring Boot bakal otomatis buatin query-nya asal namanya pas
    userModel findByUsername(String username);

    userModel findByEmail(String email);

    List<userModel> findByRole(String role);
}