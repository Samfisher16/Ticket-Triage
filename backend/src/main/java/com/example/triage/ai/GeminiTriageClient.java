package com.example.triage.ai;

import com.example.triage.model.Category;
import com.example.triage.model.Priority;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Calls the Gemini REST API and asks for a JSON answer that matches a schema.
 * Never throws: on any failure it returns TriageResult.fallback().
 */
@Component
public class GeminiTriageClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiTriageClient.class);

    private final RestClient http;
    private final ObjectMapper mapper;
    private final String apiKey;
    private final String model;

    public GeminiTriageClient(RestClient.Builder builder,
                              ObjectMapper mapper,
                              @Value("${gemini.api-key}") String apiKey,
                              @Value("${gemini.model}") String model,
                              @Value("${gemini.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(30_000);
        this.http = builder.baseUrl(baseUrl).requestFactory(factory).build();
        this.mapper = mapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public TriageResult triage(String title, String description) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not set - using fallback triage");
            return TriageResult.fallback();
        }
        try {
            JsonNode response = http.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(buildRequestBody(title, description))
                    .retrieve()
                    .body(JsonNode.class);

            String json = response.at("/candidates/0/content/parts/0/text").asText("");
            TriageResult result = mapper.readValue(json, TriageResult.class);
            if (result.category() == null || result.priority() == null) {
                throw new IllegalStateException("Incomplete AI response: " + json);
            }
            return result;
        } catch (Exception e) {
            log.error("Gemini triage failed, using fallback: {}", e.getMessage());
            return TriageResult.fallback();
        }
    }

    private Map<String, Object> buildRequestBody(String title, String description) {
        String prompt = """
                You are a support ticket triage assistant.
                Read the ticket title AND description together, then decide:
                - category
                - priority (CRITICAL = service down / data loss / security,
                            HIGH = major feature broken, no workaround,
                            MEDIUM = problem with a workaround,
                            LOW = question, cosmetic issue or feature request)
                - summary: one short sentence
                - suggestedAction: one short sentence on what to do next
                If the title and description do not match each other, mention it in the summary.

                Title: %s
                Description: %s
                """.formatted(title, description);

        Map<String, Object> schema = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "category", Map.of("type", "STRING", "enum", names(Category.values())),
                        "priority", Map.of("type", "STRING", "enum", names(Priority.values())),
                        "summary", Map.of("type", "STRING"),
                        "suggestedAction", Map.of("type", "STRING")),
                "required", List.of("category", "priority", "summary", "suggestedAction"));

        return Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json",
                        "responseSchema", schema));
    }

    private static List<String> names(Enum<?>[] values) {
        return Arrays.stream(values).map(Enum::name).toList();
    }
}
