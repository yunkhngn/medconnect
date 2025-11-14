package se1961.g1.medconnect.dto;

public class ChatbotResponse {
    private String response;
    private String conversationId;
    private boolean success;
    private String error;

    public ChatbotResponse() {
    }

    // Constructor for success response without conversationId
    public ChatbotResponse(String response, boolean isSuccess) {
        if (isSuccess) {
            this.response = response;
            this.success = true;
        } else {
            this.error = response;
            this.success = false;
        }
    }

    // Constructor for success response with conversationId (for backward compatibility)
    public ChatbotResponse(String response, String conversationId) {
        this.response = response;
        this.conversationId = conversationId;
        this.success = true;
    }

    // Static factory method for error response
    public static ChatbotResponse error(String error) {
        ChatbotResponse response = new ChatbotResponse();
        response.error = error;
        response.success = false;
        return response;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}

