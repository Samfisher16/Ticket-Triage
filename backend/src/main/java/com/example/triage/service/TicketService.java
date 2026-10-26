package com.example.triage.service;

import com.example.triage.ai.GeminiTriageClient;
import com.example.triage.ai.TriageResult;
import com.example.triage.model.Status;
import com.example.triage.model.Ticket;
import com.example.triage.repo.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository repo;
    private final GeminiTriageClient gemini;

    public TicketService(TicketRepository repo, GeminiTriageClient gemini) {
        this.repo = repo;
        this.gemini = gemini;
    }

    /** Triage first (slow network call, no DB transaction held), then save. */
    public Ticket create(String title, String description) {
        TriageResult t = gemini.triage(title, description);
        boolean aiWorked = !t.equals(TriageResult.fallback());

        Ticket ticket = new Ticket();
        ticket.setTitle(title.trim());
        ticket.setDescription(description.trim());
        ticket.setCategory(t.category());
        ticket.setPriority(t.priority());
        ticket.setSummary(t.summary());
        ticket.setSuggestedAction(t.suggestedAction());
        ticket.setAiTriaged(aiWorked);
        return repo.save(ticket);
    }

    /** Most urgent first; within the same priority, newest first. */
    public List<Ticket> list(Status status) {
        List<Ticket> tickets = (status == null) ? repo.findAll() : repo.findByStatus(status);
        return tickets.stream()
                .sorted(Comparator.comparing((Ticket t) -> t.getPriority().ordinal())
                        .thenComparing(Ticket::getCreatedAt, Comparator.reverseOrder()))
                .toList();
    }

    public Ticket get(Long id) {
        return repo.findById(id).orElseThrow(() -> new TicketNotFoundException(id));
    }

    @Transactional
    public Ticket resolve(Long id) {
        Ticket ticket = get(id);
        if (ticket.getStatus() == Status.OPEN) {
            ticket.setStatus(Status.RESOLVED);
            ticket.setResolvedAt(Instant.now());
        }
        return ticket; // managed entity: saved on commit
    }
}
