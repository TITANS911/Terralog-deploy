package com.terralog.controller;

import com.terralog.model.kategoriModel;
import com.terralog.service.kategoriService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Tambahan
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController 
@RequestMapping("/api/kategori")
@CrossOrigin(origins = "http://localhost:3000")
public class kategoriController {

    @Autowired
    private kategoriService service;

    // Ambil Semua Data
    @GetMapping
    public List<kategoriModel> tampilkanSemua() {
        return service.tampilkanSemua();
    }

    // Ambil Satu Data berdasarkan ID (PENTING untuk halaman Edit)
    @GetMapping("/{id}")
    public ResponseEntity<kategoriModel> ambilById(@PathVariable int id) {
        // Pastikan di service kamu ada method ini
        kategoriModel k = service.ambilById(id); 
        return ResponseEntity.ok(k);
    }

    // Tambah Data
    @PostMapping
    public ResponseEntity<String> tambah(@RequestBody kategoriModel k) {
        service.tambahKategori(k);
        return ResponseEntity.ok("Data berhasil ditambahkan");
    }

    // Update Data
    @PutMapping("/{id}")
    public ResponseEntity<String> ubah(@PathVariable int id, @RequestBody kategoriModel k) {
        // Pastikan k.getNamaKategori() tidak null
        service.updateKategori(id, k.getNamaKategori());
        return ResponseEntity.ok("Data berhasil diubah");
    }

    // Hapus Data
    @DeleteMapping("/{id}")
    public ResponseEntity<String> hapus(@PathVariable int id) {
        service.hapusKategori(id);
        return ResponseEntity.ok("Data berhasil dihapus");
    }
}