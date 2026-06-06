package com.terralog.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.terralog.model.userModel;
import com.terralog.repository.userRepository;
import com.terralog.service.userService;

@Service
public class userServiceImpl implements userService {

    @Autowired
    private userRepository userRepository;

    @Override
    public List<userModel> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public userModel getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public userModel saveUser(userModel user) {
        return userRepository.save(user);
    }

    @Override
    public List<userModel> getUsersByRole(String role) {
        // Lebih bagus pakai query repository langsung biar cepat
        return userRepository.findByRole(role); 
    }

    @Override
    public userModel login(String username, String password) {
        // Cari user berdasarkan username
        userModel user = userRepository.findByUsername(username);
        
        // Cek apakah user ada dan passwordnya cocok
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }
}