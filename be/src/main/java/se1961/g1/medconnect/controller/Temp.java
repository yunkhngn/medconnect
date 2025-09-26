package se1961.g1.medconnect.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class Temp {
    @GetMapping("/hello")
    public String hello() {
        return "hello world";
    }
}
