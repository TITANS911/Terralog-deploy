package com.terralog.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "waste")
public class sampahModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "waste_id")
    private Long wasteId;

    @Column(name = "nama_sampah", length = 50)
    private String namaSampah;

    @Column(name = "deskripsi")
    private String deskripsi;

    // Relasi ke User
    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private userModel user;

    @Column(name = "id_kategori")
    private Long idKategori;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_kategori", insertable = false, updatable = false)
    private kategoriModel kategori; 

    @Column(name = "berat")
    private Double berat;

    @Column(name = "tanggal_input")
    private LocalDateTime tanggalInput = LocalDateTime.now();
    
    private String status = "PENDING";

    public Long getIdKategori() {
        return idKategori;
    }

    public void setIdKategori(Long idKategori) {
        this.idKategori = idKategori;
    }

    public kategoriModel getKategori() {
        return kategori;
    }

    public void setKategori(kategoriModel kategori) {
        this.kategori = kategori;
    }

    // Getter & Setter untuk berat
    public Double getBerat() {
        return berat;
    }

    public void setBerat(Double berat) {
        this.berat = berat;
    }

    
    public userModel getUser() { return user; }
    public void setUser(userModel user) { this.user = user; }

    public String getDeskripsi() { return deskripsi; }
    public void setDeskripsi(String deskripsi) { this.deskripsi = deskripsi; }

    public String getNamaSampah() { return namaSampah; }
    public void setNamaSampah(String namaSampah) { this.namaSampah = namaSampah; }

    public Long getWasteId() { return wasteId; }
    public void setWasteId(Long wasteId) { this.wasteId = wasteId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDateTime getTanggalInput() { return tanggalInput; }
    public void setTanggalInput(LocalDateTime tanggalInput) { this.tanggalInput = tanggalInput; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}