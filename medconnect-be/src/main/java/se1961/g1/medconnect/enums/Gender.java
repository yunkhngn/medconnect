package se1961.g1.medconnect.enums;

public enum Gender {
    MALE("male", "Nam"),
    FEMALE("female", "Nữ"),
    OTHER("other", "Khác");

    private final String value;
    private final String displayName;

    Gender(String value, String displayName) {
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
