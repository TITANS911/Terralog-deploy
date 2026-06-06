package com.terralog.controller;

import com.terralog.model.sampahModel;
import com.terralog.service.sampahService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waste")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class sampahController {

    @Autowired
    private sampahService sampahService;

    // 1. Tambah Data Sampah (POST)
    @PostMapping
    public sampahModel create(@RequestBody sampahModel sampah) {
        return sampahService.saveSampah(sampah);
    }

    // 2. Ambil Semua Data
    @GetMapping
    public List<sampahModel> getAll() {
        return sampahService.getAllSampah();
    }

    // --- TAMBAHAN BARU UNTUK DASHBOARD ---

    // 2b. Ambil Total Berat Sampah yang SELESAI (untuk angka 92kg di dashboard)
    @GetMapping("/total-selesai")
    public Double getTotalSelesai() {
        return sampahService.getTotalBeratSelesai();
    }

    // 2c. Ambil data berdasarkan status (untuk filter list dashboard)
    @GetMapping("/status/{status}")
    public List<sampahModel> getByStatus(@PathVariable String status) {
        return sampahService.getSampahByStatus(status);
    }

    // --------------------------------------

    // 3. Ambil Data Spesifik per Warga
    @GetMapping("/user/{userId}")
    public List<sampahModel> getByUserId(@PathVariable Long userId) {
        return sampahService.getSampahByUserId(userId);
    }

    // 4. Update Status
    @PutMapping("/{id}/status")
    public sampahModel updateStatus(@PathVariable Long id, @RequestBody String status) {
        String cleanStatus = status.replace("\"", "").trim();
        return sampahService.updateStatus(id, cleanStatus);
    }

    // 5. Hapus Data
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        sampahService.deleteSampah(id);
        return "Data sampah berhasil dihapus!";
    }

    @GetMapping("/{id}")
    public sampahModel getById(@PathVariable Long id) {
        return sampahService.getSampahById(id);
    }

    // 6. Update seluruh data sampah
    @PutMapping("/{id}")
    public sampahModel update(@PathVariable Long id, @RequestBody sampahModel sampahDetails) {
        return sampahService.updateSampah(id, sampahDetails);
    }
}