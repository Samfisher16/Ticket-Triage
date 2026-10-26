package com.example.triage.ai;

import com.example.triage.model.Category;
import com.example.triage.model.Priority;

/** What the AI decides about a ticket. */
public record TriageResult(Category category, Priority priority, String summary, String suggestedAction) {

    /** Used when Gemini is unreachable, over quota, or returns garbage. */
    public static TriageResult fallback() {
        return new TriageResult(Category.OTHER, Priority.MEDIUM,
                "Not triaged by AI (Gemini unavailable).",
                "Review this ticket manually.");
    }
}
