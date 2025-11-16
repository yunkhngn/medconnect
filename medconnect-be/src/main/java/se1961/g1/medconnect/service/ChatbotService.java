package se1961.g1.medconnect.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private static final String DATASET_PATH = "dataset/";
    private List<String> datasetContent = null;

    /**
     * Load all dataset files into memory
     */
    private void loadDataset() {
        if (datasetContent != null) return; // Already loaded

        datasetContent = new ArrayList<>();
        try {
            // Load FAQ files
            String[] faqFiles = {"faq/patient-faq.txt", "faq/doctor-faq.txt", "faq/system-faq.txt"};
            for (String file : faqFiles) {
                String content = readFile(DATASET_PATH + file);
                if (content != null && !content.trim().isEmpty()) {
                    datasetContent.add(content);
                }
            }

            // Load policy files
            String[] policyFiles = {"policies/cancellation-policy.txt", "policies/payment-policy.txt"};
            for (String file : policyFiles) {
                String content = readFile(DATASET_PATH + file);
                if (content != null && !content.trim().isEmpty()) {
                    datasetContent.add(content);
                }
            }

            // Load guide files
            String[] guideFiles = {"guides/video-call-guide.md", "guides/technical-specs.md"};
            for (String file : guideFiles) {
                String content = readFile(DATASET_PATH + file);
                if (content != null && !content.trim().isEmpty()) {
                    datasetContent.add(content);
                }
            }

            // Load medical data
            String medicalContent = readFile(DATASET_PATH + "medical/diseases-symptoms.json");
            if (medicalContent != null && !medicalContent.trim().isEmpty()) {
                datasetContent.add("Thông tin y tế: " + medicalContent);
            }

        } catch (Exception e) {
            System.err.println("Error loading dataset: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Read file from classpath
     */
    private String readFile(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            if (!resource.exists()) {
                System.out.println("File not found: " + path);
                return null;
            }
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                return reader.lines().collect(Collectors.joining("\n"));
            }
        } catch (Exception e) {
            System.err.println("Error reading file " + path + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Simple keyword-based search for relevant context
     * In production, you might want to use embeddings/vector search
     */
    private List<String> searchRelevantContext(String query, int maxResults) {
        loadDataset();
        if (datasetContent == null || datasetContent.isEmpty()) {
            return Collections.emptyList();
        }

        String queryLower = query.toLowerCase();
        List<Map.Entry<String, Integer>> scored = new ArrayList<>();

        for (String content : datasetContent) {
            String contentLower = content.toLowerCase();
            int score = 0;
            
            // Simple keyword matching
            String[] queryWords = queryLower.split("\\s+");
            for (String word : queryWords) {
                if (word.length() > 2 && contentLower.contains(word)) {
                    score += contentLower.split(word, -1).length - 1; // Count occurrences
                }
            }
            
            if (score > 0) {
                scored.add(new AbstractMap.SimpleEntry<>(content, score));
            }
        }

        // Sort by score descending and return top results
        return scored.stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(maxResults)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Call Gemini API with RAG context
     */
    public String generateResponse(String userMessage) {
        try {
            if (geminiApiKey == null || geminiApiKey.isEmpty()) {
                System.err.println("[ChatbotService] GEMINI_API_KEY is not configured - chatbot will be disabled");
                // Don't throw exception, just return error response - chatbot is optional
                return "Chatbot service is not configured. Please set GEMINI_API_KEY environment variable.";
            }
            System.out.println("[ChatbotService] GEMINI_API_KEY is configured (length: " + geminiApiKey.length() + ")");

            // Search for relevant context
            System.out.println("[ChatbotService] Searching for relevant context...");
            List<String> relevantContexts = searchRelevantContext(userMessage, 2); // Reduce to 2 contexts
            System.out.println("[ChatbotService] Found " + relevantContexts.size() + " relevant contexts");
            
            // Limit context length to avoid long prompts (max 1500 chars per context, total max 2000 chars)
            final int MAX_CONTEXT_LENGTH = 2000;
            final int MAX_CONTEXT_PER_ITEM = 800;
            StringBuilder contextBuilder = new StringBuilder();
            int totalContextLength = 0;
            
            for (String context : relevantContexts) {
                if (context == null || context.trim().isEmpty()) continue;
                
                // Truncate each context if too long
                String truncatedContext = context.length() > MAX_CONTEXT_PER_ITEM 
                    ? context.substring(0, MAX_CONTEXT_PER_ITEM) + "..."
                    : context;
                
                if (totalContextLength + truncatedContext.length() + 10 > MAX_CONTEXT_LENGTH) {
                    // If adding this would exceed limit, truncate it further
                    int remaining = MAX_CONTEXT_LENGTH - totalContextLength - 10;
                    if (remaining > 100) {
                        truncatedContext = truncatedContext.substring(0, remaining) + "...";
                    } else {
                        break; // No more space
                    }
                }
                
                if (contextBuilder.length() > 0) {
                    contextBuilder.append("\n\n---\n\n");
                }
                contextBuilder.append(truncatedContext);
                totalContextLength += truncatedContext.length() + 10;
                
                if (totalContextLength >= MAX_CONTEXT_LENGTH) {
                    break;
                }
            }
            
            String contextText = contextBuilder.toString();

            // Build prompt with RAG context - keep it concise
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Bạn là trợ lý y tế AI của MedConnect.\n\n");
            
            if (!contextText.isEmpty()) {
                promptBuilder.append("Thông tin từ cơ sở dữ liệu:\n");
                promptBuilder.append(contextText);
                promptBuilder.append("\n\n---\n\n");
            }
            
            promptBuilder.append("Câu hỏi: ");
            promptBuilder.append(userMessage);
            promptBuilder.append("\n\nTrả lời ngắn gọn dựa trên thông tin trên. Nếu không đủ, dùng kiến thức y tế chung. ");
            promptBuilder.append("Nhắc: đây chỉ là tư vấn sơ bộ, nên đặt lịch khám bác sĩ để chẩn đoán chính xác.");

            String prompt = promptBuilder.toString();
            System.out.println("[ChatbotService] Prompt length: " + prompt.length() + " characters");
            System.out.println("[ChatbotService] Context length: " + contextText.length() + " characters");
            System.out.println("[ChatbotService] ========== FULL PROMPT ==========");
            System.out.println(prompt);
            System.out.println("[ChatbotService] ========== END PROMPT ==========");

            // Call Gemini API
            System.out.println("[ChatbotService] Calling Gemini API...");
            String response = callGeminiAPI(prompt);
            System.out.println("[ChatbotService] Received response from Gemini (length: " + (response != null ? response.length() : 0) + ")");
            return response;

        } catch (Exception e) {
            System.err.println("Error generating response: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể tạo phản hồi: " + e.getMessage());
        }
    }

    /**
     * Call Gemini API using HTTP request with retry logic for rate limiting
     */
    private String callGeminiAPI(String prompt) {
        int maxRetries = 0; // NO RETRIES - fail immediately to avoid rate limit
        long baseDelayMs = 10000; // 10 seconds base delay (not used since no retries)
        
        // Log request attempt
        System.out.println("[ChatbotService] Attempting to call Gemini API (prompt length: " + prompt.length() + " chars)");
        
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=" + geminiApiKey;
                
                // Build request body
                Map<String, Object> requestBody = new HashMap<>();
                Map<String, Object> content = new HashMap<>();
                Map<String, Object> part = new HashMap<>();
                part.put("text", prompt);
                List<Map<String, Object>> parts = new ArrayList<>();
                parts.add(part);
                content.put("parts", parts);
                List<Map<String, Object>> contents = new ArrayList<>();
                contents.add(content);
                requestBody.put("contents", contents);
                
                Map<String, Object> generationConfig = new HashMap<>();
                generationConfig.put("temperature", 0.7);
                generationConfig.put("topK", 40);
                generationConfig.put("topP", 0.95);
                generationConfig.put("maxOutputTokens", 1024); // Reduce from 2048 to 1024 to save tokens
                requestBody.put("generationConfig", generationConfig);

                // Convert to JSON using Jackson
                ObjectMapper objectMapper = new ObjectMapper();
                String requestBodyJson = objectMapper.writeValueAsString(requestBody);

                // Make HTTP request
                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(java.net.URI.create(url))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                        .build();

                HttpResponse<String> response = client.send(request, 
                        HttpResponse.BodyHandlers.ofString());

                // Handle 429 (Rate Limit) - Parse retry delay from response
                if (response.statusCode() == 429) {
                    System.err.println("[ChatbotService] ⚠️ RATE LIMIT EXCEEDED (429)!");
                    String responseBody = response.body();
                    System.err.println("[ChatbotService] Response body: " + responseBody);
                    
                    // Try to parse retry delay from response
                    long retryDelaySeconds = 300; // Default: 5 minutes (300 seconds)
                    try {
                        // Use existing objectMapper from above
                        @SuppressWarnings("unchecked")
                        Map<String, Object> errorResponse = objectMapper.readValue(responseBody, Map.class);
                        @SuppressWarnings("unchecked")
                        Map<String, Object> error = (Map<String, Object>) errorResponse.get("error");
                        if (error != null) {
                            // Check message for retry delay
                            String message = (String) error.get("message");
                            if (message != null && message.contains("Please retry in")) {
                                // Extract seconds from "Please retry in 25.796353428s"
                                String[] messageParts = message.split("Please retry in ");
                                if (messageParts.length > 1) {
                                    // Remove "s" and any trailing dots/whitespace
                                    String delayStr = messageParts[1].replace("s", "").trim();
                                    // Remove trailing dots if any
                                    while (delayStr.endsWith(".")) {
                                        delayStr = delayStr.substring(0, delayStr.length() - 1).trim();
                                    }
                                    try {
                                        retryDelaySeconds = (long) Math.ceil(Double.parseDouble(delayStr));
                                        System.out.println("[ChatbotService] Parsed retry delay from message: " + retryDelaySeconds + " seconds (from: " + delayStr + ")");
                                    } catch (NumberFormatException e) {
                                        System.err.println("[ChatbotService] Could not parse retry delay from message: " + delayStr + " - " + e.getMessage());
                                    }
                                }
                            }
                            
                            // Also check RetryInfo in details
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> details = (List<Map<String, Object>>) error.get("details");
                            if (details != null) {
                                for (Map<String, Object> detail : details) {
                                    if ("type.googleapis.com/google.rpc.RetryInfo".equals(detail.get("@type"))) {
                                        // retryDelay can be either a String like "25s" or a Map with "seconds" field
                                        Object retryDelayObj = detail.get("retryDelay");
                                        if (retryDelayObj != null) {
                                            try {
                                                if (retryDelayObj instanceof String) {
                                                    // Parse string like "25s" or "25"
                                                    String delayStr = ((String) retryDelayObj).replace("s", "").trim();
                                                    retryDelaySeconds = (long) Math.ceil(Double.parseDouble(delayStr));
                                                    System.out.println("[ChatbotService] Parsed retry delay from RetryInfo (String): " + retryDelaySeconds + " seconds (from: " + retryDelayObj + ")");
                                                } else if (retryDelayObj instanceof Map) {
                                                    // Parse Map with "seconds" field
                                                    @SuppressWarnings("unchecked")
                                                    Map<String, Object> retryInfo = (Map<String, Object>) retryDelayObj;
                                                    Object secondsObj = retryInfo.get("seconds");
                                                    if (secondsObj != null) {
                                                        if (secondsObj instanceof String) {
                                                            retryDelaySeconds = (long) Math.ceil(Double.parseDouble((String) secondsObj));
                                                        } else if (secondsObj instanceof Number) {
                                                            retryDelaySeconds = ((Number) secondsObj).longValue();
                                                        }
                                                        System.out.println("[ChatbotService] Parsed retry delay from RetryInfo (Map): " + retryDelaySeconds + " seconds");
                                                    }
                                                }
                                            } catch (Exception e) {
                                                System.err.println("[ChatbotService] Could not parse retry delay from RetryInfo: " + e.getMessage() + " (type: " + retryDelayObj.getClass().getSimpleName() + ")");
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("[ChatbotService] Could not parse retry delay from response, using default: " + e.getMessage());
                    }
                    
                    // Add buffer time (50% more) to be safe
                    retryDelaySeconds = (long) (retryDelaySeconds * 1.5);
                    long retryDelayMinutes = retryDelaySeconds / 60;
                    long retryDelaySecs = retryDelaySeconds % 60;
                    String delayMessage = retryDelayMinutes > 0 
                        ? String.format("%d phút %d giây", retryDelayMinutes, retryDelaySecs)
                        : String.format("%d giây", retryDelaySeconds);
                    
                    System.err.println("[ChatbotService] Calculated retry delay: " + retryDelaySeconds + " seconds (" + delayMessage + ")");
                    throw new RuntimeException("Đã vượt quá giới hạn API. Vui lòng đợi " + delayMessage + " trước khi thử lại.");
                }

                if (response.statusCode() != 200) {
                    throw new RuntimeException("Gemini API error: " + response.statusCode() + " - " + response.body());
                }

                // Parse response using Jackson
                String responseBody = response.body();
                System.out.println("[ChatbotService] Response body length: " + (responseBody != null ? responseBody.length() : 0));
                System.out.println("[ChatbotService] Response body (first 500 chars): " + (responseBody != null && responseBody.length() > 500 ? responseBody.substring(0, 500) + "..." : responseBody));
                
                @SuppressWarnings("unchecked")
                Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
                
                // Check for errors in response
                if (responseMap.containsKey("error")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> error = (Map<String, Object>) responseMap.get("error");
                    String errorMsg = error != null ? (String) error.get("message") : "Unknown error";
                    throw new RuntimeException("Gemini API error in response: " + errorMsg);
                }
                
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
                if (candidates == null || candidates.isEmpty()) {
                    System.err.println("[ChatbotService] No candidates in response. Full response: " + responseBody);
                    // Check if there's a promptFeedback (safety filter)
                    @SuppressWarnings("unchecked")
                    Map<String, Object> promptFeedback = (Map<String, Object>) responseMap.get("promptFeedback");
                    if (promptFeedback != null) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> blockReason = (Map<String, Object>) promptFeedback.get("blockReason");
                        if (blockReason != null) {
                            String reason = (String) blockReason.get("blockReason");
                            throw new RuntimeException("Gemini API blocked the request: " + reason);
                        }
                    }
                    throw new RuntimeException("No candidates in Gemini response. Response may have been blocked by safety filters.");
                }

                Map<String, Object> candidate = candidates.get(0);
                
                // Check for finishReason (might indicate blocking)
                Object finishReason = candidate.get("finishReason");
                if (finishReason != null && !"STOP".equals(finishReason)) {
                    System.err.println("[ChatbotService] Finish reason: " + finishReason);
                    if ("SAFETY".equals(finishReason) || "RECITATION".equals(finishReason)) {
                        throw new RuntimeException("Gemini API blocked the response due to safety filters. Finish reason: " + finishReason);
                    }
                }
                
                @SuppressWarnings("unchecked")
                Map<String, Object> contentObj = (Map<String, Object>) candidate.get("content");
                if (contentObj == null) {
                    System.err.println("[ChatbotService] No content in candidate. Candidate: " + candidate);
                    throw new RuntimeException("No content in Gemini response candidate");
                }
                
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> responseParts = (List<Map<String, Object>>) contentObj.get("parts");
                
                if (responseParts == null || responseParts.isEmpty()) {
                    System.err.println("[ChatbotService] No parts in content. Content: " + contentObj);
                    System.err.println("[ChatbotService] Full candidate: " + candidate);
                    throw new RuntimeException("No parts in Gemini response. The response may have been blocked or filtered.");
                }

                String text = (String) responseParts.get(0).get("text");
                if (text == null || text.trim().isEmpty()) {
                    System.err.println("[ChatbotService] Empty text in parts. Parts: " + responseParts);
                    throw new RuntimeException("Empty response from Gemini");
                }

                System.out.println("[ChatbotService] Successfully parsed response (length: " + text.length() + " chars)");
                return text.trim();
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Request bị gián đoạn: " + e.getMessage());
            } catch (Exception e) {
                if (attempt < maxRetries - 1) {
                    // Retry on other errors too (network issues, etc.)
                    long retryDelay = baseDelayMs * (long) Math.pow(2, attempt);
                    System.out.println("[ChatbotService] Error on attempt " + (attempt + 1) + ", retrying in " + (retryDelay / 1000) + " seconds: " + e.getMessage());
                    try {
                        Thread.sleep(retryDelay);
                        continue;
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Request bị gián đoạn: " + ie.getMessage());
                    }
                } else {
                    // Last attempt failed
                    System.err.println("Error calling Gemini API after " + maxRetries + " attempts: " + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("Lỗi khi gọi Gemini API: " + e.getMessage());
                }
            }
        }
        
        // Should never reach here, but just in case
        throw new RuntimeException("Không thể gọi Gemini API sau " + maxRetries + " lần thử");
    }
}

