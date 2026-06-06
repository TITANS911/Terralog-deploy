package com.terralog.service;

import com.terralog.model.jadwalModel;
import java.time.LocalDate;
import java.util.List;

public interface jadwalService {
    jadwalModel createJadwal(jadwalModel jadwal);
    List<jadwalModel> getAllJadwal();
    jadwalModel getJadwalById(Integer id);
    List<jadwalModel> getJadwalByTanggal(LocalDate tanggal);
    jadwalModel updateJadwal(Integer id, jadwalModel jadwalDetails);
    void deleteJadwal(Integer id);
}