package com.example.triage.web;

import com.example.triage.model.Status;
import com.example.triage.model.Ticket;
import com.example.triage.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket create(@Valid @RequestBody CreateTicketRequest req) {
        return service.create(req.title(), req.description());
    }

    @GetMapping
    public List<Ticket> list(@RequestParam(required = false) Status status) {
        return service.list(status);
    }

    @GetMapping("/{id}")
    public Ticket get(@PathVariable Long id) {
        return service.get(id);
    }

    @PatchMapping("/{id}/resolve")
    public Ticket resolve(@PathVariable Long id) {
        return service.resolve(id);
    }
}
