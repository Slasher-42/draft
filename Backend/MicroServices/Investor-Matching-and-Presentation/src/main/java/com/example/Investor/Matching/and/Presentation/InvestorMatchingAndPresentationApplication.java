package com.example.Investor.Matching.and.Presentation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class InvestorMatchingAndPresentationApplication {

	public static void main(String[] args) {
		SpringApplication.run(InvestorMatchingAndPresentationApplication.class, args);
	}

}
