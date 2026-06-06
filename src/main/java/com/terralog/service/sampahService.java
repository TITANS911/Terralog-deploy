package com.terralog.service;

import com.terralog.model.sampahModel;
import java.util.List;

public interface sampahService {
    sampahModel saveSampah(sampahModel sampah);
    List<sampahModel> getAllSampah();
    List<sampahModel> getSampahByUserId(Long userId);
    sampahModel updateStatus(Long id, String status);
    sampahModel getSampahById(Long id);
    void deleteSampah(Long id);
    // Method baru untuk update seluruh data sampah
    sampahModel updateSampah(Long id, sampahModel sampahDetails);

    Double getTotalBeratSelesai();
    
    // Method untuk mendapatkan sampah berdasarkan status (misal: "PENDING")
    List<sampahModel> getSampahByStatus(String status);
}