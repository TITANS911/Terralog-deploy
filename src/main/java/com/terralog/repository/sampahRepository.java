package com.terralog.repository;

import com.terralog.model.sampahModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface sampahRepository extends JpaRepository<sampahModel, Long> {
    
    // Tetap bisa mencari berdasarkan userId
    List<sampahModel> findByUserId(Long userId);

    // --- TAMBAHAN UNTUK DASHBOARD ---
    
    // Query untuk menghitung total berat sampah yang sudah SELESAI
    @Query("SELECT SUM(w.berat) FROM sampahModel w WHERE w.status = 'SELESAI'")
    Double hitungTotalBeratSelesai();

    // Query untuk mencari transaksi berdasarkan status
    List<sampahModel> findByStatus(String status);
}