package se1961.g1.medconnect.enums;

public enum PatientStatus {
    ALL("all", "Tất cả trạng thái"),
    ACTIVE("active", "Hoạt động"),
    INACTIVE("inactive", "Tạm ngưng"),
    BLOCKED("blocked", "Đã khóa");

    private final String value;
    private final String displayName;

    PatientStatus(String value, String displayName) {
        this.value = value;
        this.displayName = displayName;
    }

    public String getValue() {
        return value;
    }

    public String getDisplayName() {
        return displayName;
    }
}
