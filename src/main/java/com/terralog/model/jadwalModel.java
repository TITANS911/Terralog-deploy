package com.terralog.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jadwal_petugas")
public class jadwalModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_jadwal")
    private Integer idJadwal;

    // Menggunakan tipe kelas userModel sesuai dengan file milikmu
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private userModel user; 

    @Column(name = "tanggal_tugas", nullable = false)
    private LocalDate tanggalTugas;

    @Column(name = "shift", nullable = false, length = 50)
    private String shift;

    @Column(name = "lokasi_tugas", length = 255)
    private String lokasiTugas;

    @Column(name = "keterangan", columnDefinition = "TEXT")
    private String keterangan;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- Getter dan Setter ---
    public Integer getIdJadwal() { return idJadwal; }
    public void setIdJadwal(Integer idJadwal) { this.idJadwal = idJadwal; }

    public userModel getUser() { return user; }
    public void setUser(userModel user) { this.user = user; }

    public LocalDate getTanggalTugas() { return tanggalTugas; }
    public void setTanggalTugas(LocalDate tanggalTugas) { this.tanggalTugas = tanggalTugas; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public String getLokasiTugas() { return lokasiTugas; }
    public void setLokasiTugas(String lokasiTugas) { this.lokasiTugas = lokasiTugas; }

    public String getKeterangan() { return keterangan; }
    public void setKeterangan(String keterangan) { this.keterangan = keterangan; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}