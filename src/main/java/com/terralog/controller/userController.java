package com.terralog.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.terralog.model.userModel;
import com.terralog.service.userService;

@RestController
@RequestMapping("/api/users")
public class userController {

    @Autowired
    private userService userService;

    // --- GET ALL USERS ---
    @GetMapping
    public List<userModel> getAllUsers() {
        return userService.getAllUsers();
    }

    // --- CREATE USER ---
    @PostMapping
    public ResponseEntity<userModel> createUser(@RequestBody userModel user) {
        userModel createdUser = userService.saveUser(user);
        return ResponseEntity.ok(createdUser);
    }

    // --- GET USER BY ID ---
    @GetMapping("/{id}")
    public ResponseEntity<userModel> getUserById(@PathVariable Long id) {
        userModel user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build(); // Kirim status 404 ke React
        }
    }

    // --- UPDATE USER ---
    @PutMapping("/{id}")
    public ResponseEntity<userModel> updateUser(@PathVariable Long id, @RequestBody userModel dataBaru) {
        userModel userLama = userService.getUserById(id);

        if (userLama != null) {
            userLama.setNama(dataBaru.getNama());
            userLama.setAlamat(dataBaru.getAlamat());
            userLama.setNoHp(dataBaru.getNoHp());
            userLama.setKomplek(dataBaru.getKomplek());
            userLama.setRole(dataBaru.getRole());
            userLama.setUsername(dataBaru.getUsername());
            // Tambahkan update email
            userLama.setEmail(dataBaru.getEmail());

            // Logic Password: Hanya update jika ada inputan (tidak kosong atau spasi doang)
            if (dataBaru.getPassword() != null && !dataBaru.getPassword().trim().isEmpty()) {
                userLama.setPassword(dataBaru.getPassword());
            }

            userModel updatedUser = userService.saveUser(userLama);
            return ResponseEntity.ok(updatedUser);
        }
        
        return ResponseEntity.notFound().build();
    }

    // --- DELETE USER ---
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User dengan ID " + id + " berhasil dihapus");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Gagal menghapus user: " + e.getMessage());
        }
    }
}