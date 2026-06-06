package com.terralog.model;

import jakarta.persistence.*;

@Entity
@Table(name = "warga")
public class wargaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
