package se1961.g1.medconnect.util;

public interface PackableEx extends Packable {
    void unmarshal(ByteBuf in);
}
