package com.terralog.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "transaction") // Sesuai dengan nama tabel di database kamu
public class transaksiModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id") // Sesuai dengan kolom di database
    private Long transaksiId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id") // Sesuai dengan kolom di database
    private userModel user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "petugas_id") // Sesuai dengan kolom di database
    private userModel petugas;

    @Column(name = "tanggal")
    private LocalDate tanggal;

    @Column(name = "lokasi")
    private String lokasi;

    public String getKategoriSampah() {
        return kategoriSampah;
    }

    public void setKategoriSampah(String kategoriSampah) {
        this.kategoriSampah = kategoriSampah;
    }

    public Double getTotalBerat() {
        return totalBerat;
    }

    public void setTotalBerat(Double totalBerat) {
        this.totalBerat = totalBerat;
    }

    @Column(name = "foto")
    private String foto;

    @Column(name = "kategori_sampah")
    private String kategoriSampah;

    @Column(name = "total_berat")
    private Double totalBerat;

    public Long getTransaksiId() {
        return transaksiId;
    }

    public void setTransaksiId(Long transaksiId) {
        this.transaksiId = transaksiId;
    }

    public userModel getUser() {
        return user;
    }

    public void setUser(userModel user) {
        this.user = user;
    }

    public userModel getPetugas() {
        return petugas;
    }

    public void setPetugas(userModel petugas) {
        this.petugas = petugas;
    }

    public LocalDate getTanggal() {
        return tanggal;
    }

    public void setTanggal(LocalDate tanggal) {
        this.tanggal = tanggal;
    }

    public String getLokasi() {
        return lokasi;
    }

    public void setLokasi(String lokasi) {
        this.lokasi = lokasi;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
    
}