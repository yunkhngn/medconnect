package se1961.g1.medconnect.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Upload avatar to Cloudinary
     * @param file MultipartFile image
     * @param userId User ID for organizing folders
     * @return URL of uploaded image
     */
    public String uploadAvatar(MultipartFile file, String userId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }

        // Generate unique filename
        String publicId = "medconnect/avatars/" + userId + "/" + UUID.randomUUID();

        // Upload to Cloudinary
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "medconnect/avatars",
                "transformation", new com.cloudinary.Transformation<>()
                        .width(400)
                        .height(400)
                        .crop("fill")
                        .gravity("face")
                        .quality("auto")
                        .fetchFormat("auto")
        ));

        // Return secure URL
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Upload medical ID photo to Cloudinary (3:4 ratio)
     * @param file MultipartFile image
     * @param userId User ID for organizing folders
     * @return URL of uploaded image
     */
    public String uploadMedicalPhoto(MultipartFile file, String userId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }

        // Generate unique filename for medical photos
        String publicId = "medconnect/medical_photos/" + userId + "/" + UUID.randomUUID();

        // Upload to Cloudinary with 3:4 aspect ratio
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "medconnect/medical_photos",
                "transformation", new com.cloudinary.Transformation<>()
                        .width(600)
                        .height(800)
                        .crop("fill")
                        .gravity("auto")
                        .quality("auto")
                        .fetchFormat("auto")
        ));

        // Return secure URL
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Upload license proof document (PDF) to Cloudinary
     * @param file MultipartFile PDF document
     * @param userId User ID for organizing folders
     * @return URL of uploaded PDF
     */
    public String uploadLicensePDF(MultipartFile file, String userId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type (PDF only)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("File must be a PDF");
        }

        // Validate file size (max 10MB for PDF)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("PDF file size must be less than 10MB");
        }

        // Generate unique filename
        String publicId = "medconnect/licenses/" + userId + "/" + UUID.randomUUID();

        // Upload to Cloudinary
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "medconnect/licenses",
                "resource_type", "raw", // Important: "raw" for non-image files like PDF
                "format", "pdf"
        ));

        // Return secure URL
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Upload license proof image to Cloudinary
     * @param file MultipartFile image
     * @param userId User ID for organizing folders
     * @return URL of uploaded image
     */
    public String uploadLicenseImage(MultipartFile file, String userId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Validate file size (max 10MB for license images)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Image file size must be less than 10MB");
        }

        // Generate unique filename
        String publicId = "medconnect/licenses/" + userId + "/" + UUID.randomUUID();

        // Upload to Cloudinary
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "medconnect/licenses",
                "transformation", new com.cloudinary.Transformation<>()
                        .width(1200)
                        .height(1600)
                        .crop("fit")
                        .quality("auto")
                        .fetchFormat("auto")
        ));

        // Return secure URL
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Delete avatar from Cloudinary
     * @param imageUrl URL of image to delete
     */
    public void deleteAvatar(String imageUrl) {
        try {
            // Extract public_id from URL
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            // Log error but don't throw exception
            System.err.println("Error deleting image from Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/medconnect/avatars/user123/abc.jpg
     * Returns: medconnect/avatars/user123/abc
     */
    private String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }

        try {
            // Extract everything after /upload/
            int uploadIndex = imageUrl.indexOf("/upload/");
            if (uploadIndex == -1) return null;

            String afterUpload = imageUrl.substring(uploadIndex + 8); // "/upload/".length() == 8

            // Remove version (v1234567890/)
            if (afterUpload.startsWith("v")) {
                int slashIndex = afterUpload.indexOf("/");
                if (slashIndex != -1) {
                    afterUpload = afterUpload.substring(slashIndex + 1);
                }
            }

            // Remove file extension
            int dotIndex = afterUpload.lastIndexOf(".");
            if (dotIndex != -1) {
                afterUpload = afterUpload.substring(0, dotIndex);
            }

            return afterUpload;
        } catch (Exception e) {
            return null;
        }
    }
}

