package com.example.Reporting.and.Notification.Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ReportingAndNotificationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReportingAndNotificationServiceApplication.class, args);
	}

}
