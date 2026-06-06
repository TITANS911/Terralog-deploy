package com.terralog.service.impl;


import com.terralog.model.transaksiModel;
import com.terralog.model.userModel;
import com.terralog.repository.transaksiRepository;
import com.terralog.repository.userRepository;
import com.terralog.service.transaksiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class transaksiServiceImpl implements transaksiService {

    @Autowired
    private transaksiRepository transaksiRepository;

    @Autowired
    private userRepository userRepository; 

    @Override
    public transaksiModel createTransaksi(transaksiModel transaksi) {
        try {
            // 1. Validasi Input: Pastikan user dan petugas ada
            if (transaksi.getUser() == null || transaksi.getUser().getUserId() == null) {
                throw new RuntimeException("Data User (Warga) tidak boleh kosong!");
            }

            // 2. Mengambil objek User asli dari database berdasarkan ID
            userModel user = userRepository.findById(transaksi.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User dengan ID " + transaksi.getUser().getUserId() + " tidak ditemukan!"));
            
            // 3. Mengambil objek Petugas asli dari database berdasarkan ID
            if (transaksi.getPetugas() != null && transaksi.getPetugas().getUserId() != null) {
                userModel petugas = userRepository.findById(transaksi.getPetugas().getUserId())
                        .orElseThrow(() -> new RuntimeException("Petugas dengan ID " + transaksi.getPetugas().getUserId() + " tidak ditemukan!"));
                transaksi.setPetugas(petugas);
            }

            // 4. Update data transaksi dengan objek yang sudah valid
            transaksi.setUser(user);
            
            return transaksiRepository.save(transaksi);
            
        } catch (Exception e) {
            e.printStackTrace(); 
            throw e; 
        }
    }

    @Override
    public List<transaksiModel> getAllTransaksi() {
        return transaksiRepository.findAll();
    }


    @Override
    public transaksiModel getTransaksiById(Long id) {
        return transaksiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaksi tidak ditemukan dengan id: " + id));
    }

    @Override
    public transaksiModel updateTransaksi(Long id, transaksiModel transaksiDetail) {
        // 1. Ambil data transaksi yang ada di DB
        transaksiModel transaksi = getTransaksiById(id);

        // 2. Cari objek User (Warga) asli dari database
        if (transaksiDetail.getUser() != null && transaksiDetail.getUser().getUserId() != null) {
            userModel user = userRepository.findById(transaksiDetail.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User tidak ditemukan!"));
            transaksi.setUser(user);
        }

        // 3. Cari objek Petugas asli dari database
        if (transaksiDetail.getPetugas() != null && transaksiDetail.getPetugas().getUserId() != null) {
            userModel petugas = userRepository.findById(transaksiDetail.getPetugas().getUserId())
                    .orElseThrow(() -> new RuntimeException("Petugas tidak ditemukan!"));
            transaksi.setPetugas(petugas);
        }

        // 4. Update field lainnya
        transaksi.setTanggal(transaksiDetail.getTanggal());
        transaksi.setLokasi(transaksiDetail.getLokasi());
        transaksi.setKategoriSampah(transaksiDetail.getKategoriSampah()); // PENTING: Tambahkan ini
        transaksi.setTotalBerat(transaksiDetail.getTotalBerat());         // PENTING: Tambahkan ini
        
        if (transaksiDetail.getFoto() != null) {
            transaksi.setFoto(transaksiDetail.getFoto());
        }

        // 5. Simpan ke database
        return transaksiRepository.save(transaksi);
    }

    @Override
    public void deleteTransaksi(Long id) {
        transaksiModel transaksi = getTransaksiById(id);
        transaksiRepository.delete(transaksi);
    }

}