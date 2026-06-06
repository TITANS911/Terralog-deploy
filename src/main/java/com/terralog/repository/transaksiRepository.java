package com.terralog.repository;

import com.terralog.model.transaksiModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface transaksiRepository extends JpaRepository<transaksiModel, Long> {
    
}