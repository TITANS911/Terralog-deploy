package com.terralog.service;

import java.util.List;
import com.terralog.model.userModel;

public interface userService {
    List<userModel> getAllUsers();
    userModel getUserById(Long id);
    userModel saveUser(userModel user); // Ini kontraknya
    void deleteUser(Long id);
    List<userModel> getUsersByRole(String role); 
    userModel login(String username, String password);
}