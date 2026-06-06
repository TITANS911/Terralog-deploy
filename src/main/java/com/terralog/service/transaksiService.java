package com.terralog.service;

import com.terralog.model.transaksiModel;
import java.util.List;

public interface transaksiService {
    transaksiModel createTransaksi(transaksiModel transaksi);
    List<transaksiModel> getAllTransaksi();
    transaksiModel getTransaksiById(Long id);
    transaksiModel updateTransaksi(Long id, transaksiModel transaksiDetail);
    void deleteTransaksi(Long id);
    
}
