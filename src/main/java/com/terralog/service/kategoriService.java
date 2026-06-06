package com.terralog.service;

import com.terralog.model.kategoriModel;
import java.util.List;

public interface kategoriService {
    // Tambah Data
    void tambahKategori(kategoriModel k);
    
    // Ambil Semua Data
    List<kategoriModel> tampilkanSemua();
    
    // PENTING: Tambahkan ini untuk mengambil 1 data berdasarkan ID
    // Digunakan saat halaman Edit pertama kali dibuka (untuk fetch data lama)
    kategoriModel ambilById(int id); 
    
    // Update Data
    void updateKategori(int id, String namaBaru);
    
    // Hapus Data
    void hapusKategori(int id);
}