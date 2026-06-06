package com.terralog.repository;

import com.terralog.model.jadwalModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface jadwalRepository extends JpaRepository<jadwalModel, Integer> {
    
    // Mencari jadwal berdasarkan tanggal
    List<jadwalModel> findByTanggalTugas(LocalDate tanggalTugas);
    
    // Menyelaraskan pencarian berdasarkan properti userId di dalam kelas userModel
    List<jadwalModel> findByUserUserId(Long userId);
}