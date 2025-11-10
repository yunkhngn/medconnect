package se1961.g1.medconnect.enums;

public enum BloodType {
    UNKNOWN("", "Chưa xác định"),
    A("A", "A"),
    B("B", "B"),
    AB("AB", "AB"),
    O("O", "O"),
    A_POSITIVE("A+", "A+"),
    A_NEGATIVE("A-", "A-"),
    B_POSITIVE("B+", "B+"),
    B_NEGATIVE("B-", "B-"),
    AB_POSITIVE("AB+", "AB+"),
    AB_NEGATIVE("AB-", "AB-"),
    O_POSITIVE("O+", "O+"),
    O_NEGATIVE("O-", "O-");

    private final String value;
    private final String displayName;

    BloodType(String value, String displayName) {
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
