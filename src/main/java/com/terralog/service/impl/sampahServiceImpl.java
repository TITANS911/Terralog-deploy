package com.terralog.service.impl;

import com.terralog.model.sampahModel; 
import com.terralog.repository.sampahRepository;
import com.terralog.service.sampahService; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class sampahServiceImpl implements sampahService {

    @Autowired
    private sampahRepository sampahRepository;

    @Override
    public sampahModel saveSampah(sampahModel sampah) {
        return sampahRepository.save(sampah);
    }

    @Override
    public List<sampahModel> getAllSampah() {
        return sampahRepository.findAll();
    }

    @Override
    public List<sampahModel> getSampahByUserId(Long userId) {
        return sampahRepository.findByUserId(userId);
    }

    @Override
    public sampahModel updateStatus(Long id, String status) {
        sampahModel sampah = sampahRepository.findById(id).orElse(null);
        if (sampah != null) {
            sampah.setStatus(status);
            return sampahRepository.save(sampah);
        }
        return null;
    }

    @Override
    public void deleteSampah(Long id) {
        sampahRepository.deleteById(id);
    }

    @Override
    public sampahModel getSampahById(Long id) {
        return sampahRepository.findById(id).orElse(null);
    }

    // --- IMPLEMENTASI METHOD BARU ---

    @Override
    public Double getTotalBeratSelesai() {
        Double total = sampahRepository.hitungTotalBeratSelesai();
        // Jika null (misal belum ada data selesai), kembalikan 0 agar tidak error di dashboard
        return (total != null) ? total : 0.0;
    }

    @Override
    public List<sampahModel> getSampahByStatus(String status) {
        return sampahRepository.findByStatus(status);
    }
    
    @Override
    public sampahModel updateSampah(Long id, sampahModel sampahDetails) {
        sampahModel sampah = sampahRepository.findById(id).orElse(null);
        if (sampah != null) {
            // Update field yang bisa diubah
            if (sampahDetails.getNamaSampah() != null) {
                sampah.setNamaSampah(sampahDetails.getNamaSampah());
            }
            if (sampahDetails.getDeskripsi() != null) {
                sampah.setDeskripsi(sampahDetails.getDeskripsi());
            }
            if (sampahDetails.getBerat() != null) {
                sampah.setBerat(sampahDetails.getBerat());
            }
            if (sampahDetails.getIdKategori() != null) {
                sampah.setIdKategori(sampahDetails.getIdKategori());
            }
            if (sampahDetails.getUserId() != null) {
                sampah.setUserId(sampahDetails.getUserId());
            }
            return sampahRepository.save(sampah);
        }
        return null;
    }
}