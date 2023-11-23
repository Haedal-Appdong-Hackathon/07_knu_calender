package com.example.knu_map.controller;

import com.example.knu_map.dto.CrawledDataForm;
import com.example.knu_map.entity.CrawledData;
import com.example.knu_map.repository.CrawledDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
@RestController
@Slf4j
@CrossOrigin(allowedHeaders = "*")
@RequestMapping("/knu")

public class CrawledDataController {
    @Autowired
    private CrawledDataRepository crawledDataRepository;

    //크롤링 한 데이터 받음
    @PostMapping("/receive") //작명 다른거 생각해보기 ex)saveData
    public String receiveData(@RequestBody CrawledDataForm form){
        //try-catch 없어도 됨
        //오류 나도 딱히 할수있는게 없음
        //dto로 받고 entity로 변환 후 DB에 저장
        log.info("저장합니다.: "+form.getTitle());
        CrawledData crawledData = form.toEntity();
        //log.info(crawledData.toString());
        crawledDataRepository.save(crawledData);
        return "성공적으로 저장되었습니다.";
    }

    //카테고리별 데이터보냄
    @GetMapping("/getByCategory") //길다. 짧게 바꿔보기
    public ArrayList<CrawledData> getDataByCategory(@RequestParam String category) {
        ArrayList<CrawledData> dataList = crawledDataRepository.findByCategory(category);
        return dataList;
    }


    @GetMapping("/test")
    public String hello(){
        return "서버 연결 성공!";
    }
}