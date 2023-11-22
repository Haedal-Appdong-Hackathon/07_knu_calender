package com.example.knu_map.repository;

import com.example.knu_map.entity.CrawledData;
import org.hibernate.mapping.List;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.ArrayList;

public interface CrawledDataRepository extends JpaRepository<CrawledData, Long> {
    ArrayList<CrawledData> findByCategory(String category);
}
