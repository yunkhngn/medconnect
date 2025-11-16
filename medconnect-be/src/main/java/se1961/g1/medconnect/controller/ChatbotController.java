package se1961.g1.medconnect.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se1961.g1.medconnect.dto.ChatbotRequest;
import se1961.g1.medconnect.dto.ChatbotResponse;
import se1961.g1.medconnect.service.ChatbotService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    /**
     * Chat endpoint với RAG
     * POST /api/chatbot/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatbotResponse> chat(@RequestBody ChatbotRequest request) {
        try {
            if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                System.out.println("[ChatbotController] Empty message received");
                return ResponseEntity.badRequest()
                        .body(ChatbotResponse.error("Câu hỏi không được để trống"));
            }

            String userMessage = request.getMessage().trim();
            System.out.println("[ChatbotController] Received message (length: " + userMessage.length() + "): " + userMessage);
            
            // Generate response using RAG - chỉ dùng message hiện tại, không maintain conversation history
            String response = chatbotService.generateResponse(userMessage);
            System.out.println("[ChatbotController] Generated response length: " + (response != null ? response.length() : 0));

            // Không cần conversationId nữa vì mỗi request độc lập
            return ResponseEntity.ok(new ChatbotResponse(response, true));

        } catch (Exception e) {
            System.err.println("[ChatbotController] Error in chat endpoint: " + e.getMessage());
            e.printStackTrace();
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = "Đã có lỗi xảy ra khi xử lý yêu cầu";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ChatbotResponse.error(errorMsg));
        }
    }

    /**
     * Health check endpoint
     * GET /api/chatbot/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "chatbot");
        return ResponseEntity.ok(response);
    }
}

