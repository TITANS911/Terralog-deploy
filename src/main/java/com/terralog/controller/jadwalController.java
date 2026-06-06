package com.terralog.controller;

import com.terralog.model.jadwalModel;
import com.terralog.service.jadwalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/jadwal")
@CrossOrigin(origins = "*")
public class jadwalController {

    @Autowired
    private jadwalService jvService;

    // 1. Create Jadwal
    @PostMapping
    public ResponseEntity<jadwalModel> createJadwal(@RequestBody jadwalModel jadwal) {
        return ResponseEntity.ok(jvService.createJadwal(jadwal));
    }

    // 2. Get All Jadwal (Bisa filter pakai param ?tanggal=YYYY-MM-DD)
    @GetMapping
    public ResponseEntity<List<jadwalModel>> getAllJadwal(
            @RequestParam(value = "tanggal", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tanggal) {
        
        if (tanggal != null) {
            return ResponseEntity.ok(jvService.getJadwalByTanggal(tanggal));
        }
        return ResponseEntity.ok(jvService.getAllJadwal());
    }

    // 3. Get Jadwal by ID
    @GetMapping("/{id}")
    public ResponseEntity<jadwalModel> getJadwalById(@PathVariable Integer id) {
        return ResponseEntity.ok(jvService.getJadwalById(id));
    }

    // 4. Update Jadwal
    @PutMapping("/{id}")
    public ResponseEntity<jadwalModel> updateJadwal(@PathVariable Integer id, @RequestBody jadwalModel jadwalDetails) {
        return ResponseEntity.ok(jvService.updateJadwal(id, jadwalDetails));
    }

    // 5. Delete Jadwal
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJadwal(@PathVariable Integer id) {
        jvService.deleteJadwal(id);
        return ResponseEntity.ok("Jadwal dengan id " + id + " berhasil dihapus.");
    }
}