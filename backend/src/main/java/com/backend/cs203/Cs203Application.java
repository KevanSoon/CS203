package com.backend.cs203;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class Cs203Application {

	public static void main(String[] args) {
		SpringApplication.run(Cs203Application.class, args);
	}

}
