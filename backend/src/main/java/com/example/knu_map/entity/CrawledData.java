package com.example.knu_map.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter

public class CrawledData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String title;
    private String category;
    private Integer date;
    private String link;

    public CrawledData(){
    }

    public CrawledData(Long id, String title, String category, Integer date, String link) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.date = date;
        this.link = link;
    }

}
