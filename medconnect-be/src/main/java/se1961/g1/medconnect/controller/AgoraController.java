package se1961.g1.medconnect.controller;

import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.util.AgoraTokenUtil;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/agora")
public class AgoraController {
    @GetMapping("/token")
    public Map<String, Object> getToken(
        @RequestParam String channel,
        @RequestParam String uid,
        @RequestParam(defaultValue = "3600") int expire
    ) {
        // Generate token using userAccount (string) to avoid int overflow issues
        String token = AgoraTokenUtil.buildTokenWithAccount(channel, uid, expire);
        return Map.of("token", token, "channel", channel, "uid", uid, "expire", expire);
    }
}
