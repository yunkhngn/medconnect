package se1961.g1.medconnect.dto;

public class ChatbotRequest {
    private String message;
    private String conversationId; // Optional: để maintain conversation context

    public ChatbotRequest() {
    }

    public ChatbotRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }
}

