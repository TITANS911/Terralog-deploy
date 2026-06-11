package com.terralog.controller;

import com.terralog.model.transaksiModel;
import com.terralog.service.transaksiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.nio.file.Path;


@RestController
@RequestMapping("/api/transaksi")
@CrossOrigin(origins = "*") 
public class transaksiController {

    @Autowired
    private transaksiService transaksiService;

    // Create - Ditambahkan try-catch agar pesan error dari Service bisa sampai ke Frontend
    @PostMapping
    public ResponseEntity<?> createTransaksi(@RequestBody transaksiModel transaksi) {
        try {
            transaksiModel newTransaksi = transaksiService.createTransaksi(transaksi);
            return ResponseEntity.ok(newTransaksi);
        } catch (RuntimeException e) {
            // Mengembalikan pesan error spesifik (misal: "User tidak ditemukan!")
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Terjadi kesalahan sistem: " + e.getMessage());
        }
    }

    // Read All
    @GetMapping
    public ResponseEntity<List<transaksiModel>> getAllTransaksi() {
        return ResponseEntity.ok(transaksiService.getAllTransaksi());
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransaksiById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(transaksiService.getTransaksiById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/foto-data")
    public ResponseEntity<?> getTransaksiFotoData(@PathVariable Long id) {
        try {
            transaksiModel transaksi = transaksiService.getTransaksiById(id);
            String foto = transaksi.getFoto();

            if (foto == null || foto.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Foto transaksi tidak tersedia.");
            }

            String uploadDir = System.getProperty("user.dir") + "/uploads";
            Path filePath = Paths.get(uploadDir).resolve(Paths.get(foto).getFileName().toString());

            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File foto tidak ditemukan di server.");
            }

            byte[] fileBytes = Files.readAllBytes(filePath);
            String mimeType = Files.probeContentType(filePath);
            if (mimeType == null || mimeType.isBlank()) {
                mimeType = "application/octet-stream";
            }

            Map<String, String> response = new HashMap<>();
            response.put("mimeType", mimeType);
            response.put("data", Base64.getEncoder().encodeToString(fileBytes));
            response.put("fileName", filePath.getFileName().toString());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Gagal membaca file foto: " + e.getMessage());
        }
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaksi(@PathVariable Long id, @RequestBody transaksiModel transaksiDetail) {
        try {
            return ResponseEntity.ok(transaksiService.updateTransaksi(id, transaksiDetail));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaksi(@PathVariable Long id) {
        try {
            transaksiService.deleteTransaksi(id);
            return ResponseEntity.ok("Transaksi dengan ID " + id + " berhasil dihapus.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Ubah bagian ini di dalam class transaksiController
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFoto(@RequestParam("file") MultipartFile file) {
        try {
            // Ambil folder 'uploads' di root project
            String uploadDir = System.getProperty("user.dir") + "/uploads";
            Path uploadPath = Paths.get(uploadDir);
        
            // Buat folder jika belum ada
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
        
            // Simpan file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
            return ResponseEntity.ok(fileName);
        } catch (Exception e) {
            // Logging error ke console agar kita bisa lihat penyebabnya
            e.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
