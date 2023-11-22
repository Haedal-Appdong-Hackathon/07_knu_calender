package com.example.knu_map.dto;

import com.example.knu_map.entity.CrawledData;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString

public class CrawledDataForm {
    private Long id;
    private String title;
    private String category;
    private Integer date;
    private String link;

    public CrawledDataForm(Long id, String title, String category, Integer date, String link) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.date = date;
        this.link = link;
    }

    public CrawledData toEntity(){
        return new CrawledData(id,title,category,date,link);
    }
}
