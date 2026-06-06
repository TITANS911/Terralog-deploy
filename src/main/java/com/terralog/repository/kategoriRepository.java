package com.terralog.repository;

import com.terralog.model.kategoriModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface kategoriRepository extends JpaRepository<kategoriModel, Integer> {
}
