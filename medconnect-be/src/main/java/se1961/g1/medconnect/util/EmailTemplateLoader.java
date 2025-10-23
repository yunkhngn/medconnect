package se1961.g1.medconnect.util;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;

@Component
public class EmailTemplateLoader {

    private static final String TEMPLATE_BASE_PATH = "templates/email/";

    /**
     * Load email template from file and replace placeholders
     * 
     * @param templateName Name of the template file (without .html extension)
     * @param variables Map of variables to replace (e.g., {"userName": "John"})
     * @return Processed HTML content
     * @throws IOException if template file not found
     */
    public String loadTemplate(String templateName, Map<String, String> variables) throws IOException {
        String templatePath = TEMPLATE_BASE_PATH + templateName + ".html";
        
        // Load template from classpath
        ClassPathResource resource = new ClassPathResource(templatePath);
        String content = new String(
            Files.readAllBytes(Paths.get(resource.getURI())),
            StandardCharsets.UTF_8
        );
        
        // Replace all placeholders
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue() : "";
            content = content.replace(placeholder, value);
        }
        
        return content;
    }

    /**
     * Check if template exists
     */
    public boolean templateExists(String templateName) {
        String templatePath = TEMPLATE_BASE_PATH + templateName + ".html";
        ClassPathResource resource = new ClassPathResource(templatePath);
        return resource.exists();
    }
}

