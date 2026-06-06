package com.terralog.service.impl;

import com.terralog.model.kategoriModel;
import com.terralog.repository.kategoriRepository;
import com.terralog.service.kategoriService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class kategoriServiceImpl implements kategoriService {

    private final kategoriRepository kategoriRepository;

    public kategoriServiceImpl(kategoriRepository kategoriRepository) {
        this.kategoriRepository = kategoriRepository;
    }

    @Override
    public void tambahKategori(kategoriModel k) {
        kategoriRepository.save(k);
        System.out.println("Berhasil menambahkan kategori: " + k.getNamaKategori());
    }

    @Override
    public List<kategoriModel> tampilkanSemua() {
        return kategoriRepository.findAll();
    }

    @Override
    public kategoriModel ambilById(int id) {
        return kategoriRepository.findById(id).orElse(null);
    }

    @Override
    public void updateKategori(int id, String namaBaru) {
        kategoriRepository.findById(id).ifPresent(k -> {
            k.setNamaKategori(namaBaru);
            kategoriRepository.save(k);
            System.out.println("ID " + id + " berhasil diupdate.");
        });
    }

    @Override
    public void hapusKategori(int id) {
        kategoriRepository.deleteById(id);
    }
}