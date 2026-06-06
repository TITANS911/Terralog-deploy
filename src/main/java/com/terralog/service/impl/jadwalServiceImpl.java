package com.terralog.service.impl;

import com.terralog.model.jadwalModel;
import com.terralog.repository.jadwalRepository;
import com.terralog.service.jadwalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class jadwalServiceImpl implements jadwalService {

    @Autowired
    private jadwalRepository jvRepository; // Menggunakan repositori yang sudah disesuaikan

    @Override
    public jadwalModel createJadwal(jadwalModel jadwal) {
        return jvRepository.save(jadwal);
    }

    @Override
    public List<jadwalModel> getAllJadwal() {
        return jvRepository.findAll();
    }

    @Override
    public jadwalModel getJadwalById(Integer id) {
        return jvRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Jadwal tidak ditemukan dengan id: " + id));
    }

    @Override
    public List<jadwalModel> getJadwalByTanggal(LocalDate tanggal) {
        return jvRepository.findByTanggalTugas(tanggal);
    }

    @Override
    public jadwalModel updateJadwal(Integer id, jadwalModel jadwalDetails) {
        jadwalModel jadwal = getJadwalById(id);
        
        jadwal.setUser(jadwalDetails.getUser());
        jadwal.setTanggalTugas(jadwalDetails.getTanggalTugas());
        jadwal.setShift(jadwalDetails.getShift());
        jadwal.setLokasiTugas(jadwalDetails.getLokasiTugas());
        jadwal.setKeterangan(jadwalDetails.getKeterangan());
        
        return jvRepository.save(jadwal);
    }

    @Override
    public void deleteJadwal(Integer id) {
        jadwalModel jadwal = getJadwalById(id);
        jvRepository.delete(jadwal);
    }
}