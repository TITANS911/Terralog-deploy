package com.terralog.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.terralog.model.userModel;
import com.terralog.repository.userRepository;
import com.terralog.service.userService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// @CrossOrigin sudah dihapus karena sudah di-handle secara global oleh
// WebConfig.java kamu!
public class authController {

    @Autowired
    private userService userService;

    @Autowired
    private userRepository userRepository;

    private static final String GOOGLE_CLIENT_ID = "386780647181-98gmklbhernpn6c6ujeilt068bg8qsem.apps.googleusercontent.com";

    @GetMapping
    public Map<String, String> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Auth API is running");
        response.put("endpoints", "POST /api/auth/login, POST /api/auth/register");
        return response;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody userModel loginData) {
        Map<String, Object> response = new HashMap<>();

        try {
            userModel user = userService.login(loginData.getUsername(), loginData.getPassword());

            if (user != null) {
                response.put("success", true);
                response.put("message", "Login Berhasil");
                response.put("role", user.getRole());
                response.put("nama", user.getNama());
                response.put("userId", user.getUserId());
                response.put("email", user.getEmail());
                response.put("alamat", user.getAlamat());
                response.put("noHp", user.getNoHp());
                response.put("komplek", user.getKomplek());
            } else {
                response.put("success", false);
                response.put("message", "Username atau Password Salah!");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Terjadi kesalahan internal pada server: " + e.getMessage());
        }

        return response;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody userModel userData) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (userData.getRole() == null || userData.getRole().isEmpty()) {
                userData.setRole("WARGA");
            }

            userModel savedUser = userService.saveUser(userData);
            if (savedUser != null) {
                response.put("success", true);
                response.put("message", "Registrasi Berhasil!");
            } else {
                response.put("success", false);
                response.put("message", "Gagal simpan user.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/google-login")
    public Map<String, Object> googleLogin(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String credential = request.get("credential");

            // Verifikasi Google Credential
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();

                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Cek apakah user sudah ada
                userModel user = userRepository.findByEmail(email);

                if (user == null) {
                    // Buat user baru (otomatis register)
                    user = new userModel();
                    user.setEmail(email);
                    user.setNama(name);
                    user.setUsername(email.split("@")[0]);
                    user.setRole("WARGA"); // Default role WARGA
                    user.setPassword(""); // Password kosong untuk Google Login
                    // Set default kosong untuk field lainnya agar tidak null
                    user.setAlamat("");
                    user.setNoHp("");
                    user.setKomplek("");
                    userRepository.save(user);
                }

                // Return response dengan data pengguna lengkap
                response.put("success", true);
                response.put("message", "Login Google Berhasil");
                response.put("role", user.getRole());
                response.put("nama", user.getNama());
                response.put("userId", user.getUserId());
                response.put("email", user.getEmail());
                response.put("alamat", user.getAlamat());
                response.put("noHp", user.getNoHp());
                response.put("komplek", user.getKomplek());
            } else {
                response.put("success", false);
                response.put("message", "Invalid Google credential");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Google login failed: " + e.getMessage());
        }
        return response;
    }
}