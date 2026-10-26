import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Ticket } from '../models/ticket';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [DatePipe],
  template: `
    @for (t of tickets(); track t.id) {
      <article class="card" [class.done]="t.status === 'RESOLVED'">
        <header>
          <span class="badge p-{{ t.priority }}">{{ t.priority }}</span>
          <span class="badge cat">{{ t.category.replace('_', ' ') }}</span>
          @if (!t.aiTriaged) {
            <span class="badge warn" title="Gemini was unavailable; default values used">not AI-triaged</span>
          }
          <span class="date">#{{ t.id }} · {{ t.createdAt | date: 'medium' }}</span>
        </header>

        <h3>{{ t.title }}</h3>
        <p class="desc">{{ t.description }}</p>

        @if (t.summary) { <p><strong>Summary:</strong> {{ t.summary }}</p> }
        @if (t.suggestedAction) { <p><strong>Suggested action:</strong> {{ t.suggestedAction }}</p> }

        <footer>
          @if (t.status === 'OPEN') {
            <button (click)="resolve.emit(t.id)">Mark resolved</button>
          } @else {
            <span class="resolved">✔ Resolved {{ t.resolvedAt | date: 'medium' }}</span>
          }
        </footer>
      </article>
    } @empty {
      <p class="empty">No tickets here.</p>
    }
  `,
  styles: `
    .card { background: #fff; padding: 16px 20px; border-radius: 10px; margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .card.done { opacity: .65; }
    header { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
    .date { margin-left: auto; font-size: 12px; color: #667; }
    h3 { margin: 0 0 6px; font-size: 16px; }
    p { margin: 4px 0; font-size: 14px; }
    .desc { color: #52606d; white-space: pre-wrap; }
    .badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; background: #e4e7eb; }
    .p-CRITICAL { background: #fecaca; color: #991b1b; }
    .p-HIGH { background: #fed7aa; color: #9a3412; }
    .p-MEDIUM { background: #fef08a; color: #854d0e; }
    .p-LOW { background: #bbf7d0; color: #166534; }
    .warn { background: #e5e7eb; color: #374151; }
    footer { margin-top: 10px; }
    button { background: #16a34a; color: #fff; border: 0; padding: 6px 14px; border-radius: 6px; }
    .resolved { color: #166534; font-size: 13px; }
    .empty { text-align: center; color: #667; padding: 24px; }
  `,
})
export class TicketListComponent {
  tickets = input.required<Ticket[]>();
  resolve = output<number>();
}
