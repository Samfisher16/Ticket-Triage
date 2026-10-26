import { Component, OnInit, inject, signal } from '@angular/core';
import { Status, Ticket } from './models/ticket';
import { TicketService } from './services/ticket.service';
import { TicketFormComponent } from './components/ticket-form.component';
import { TicketListComponent } from './components/ticket-list.component';

type Filter = Status | 'ALL';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TicketFormComponent, TicketListComponent],
  template: `
    <main>
      <h1>🎫 Ticket Triage</h1>

      <app-ticket-form (created)="load()" />

      <nav>
        @for (f of filters; track f) {
          <button [class.active]="filter() === f" (click)="setFilter(f)">{{ f }}</button>
        }
      </nav>

      @if (error()) { <p class="error">{{ error() }}</p> }

      <app-ticket-list [tickets]="tickets()" (resolve)="resolve($event)" />
    </main>
  `,
  styles: `
    main { max-width: 760px; margin: 0 auto; padding: 24px 16px 48px; }
    h1 { margin: 0 0 20px; font-size: 24px; }
    nav { display: flex; gap: 8px; margin: 24px 0 12px; }
    nav button { background: #e4e7eb; border: 0; padding: 6px 14px; border-radius: 6px; }
    nav button.active { background: #1f2933; color: #fff; }
    .error { color: #b91c1c; }
  `,
})
export class AppComponent implements OnInit {
  private api = inject(TicketService);

  filters: Filter[] = ['OPEN', 'RESOLVED', 'ALL'];
  filter = signal<Filter>('OPEN');
  tickets = signal<Ticket[]>([]);
  error = signal('');

  ngOnInit(): void {
    this.load();
  }

  setFilter(f: Filter): void {
    this.filter.set(f);
    this.load();
  }

  load(): void {
    const f = this.filter();
    this.api.list(f === 'ALL' ? undefined : f).subscribe({
      next: (t) => { this.tickets.set(t); this.error.set(''); },
      error: () => this.error.set('Cannot reach the backend on :8080. Is it running?'),
    });
  }

  resolve(id: number): void {
    this.api.resolve(id).subscribe({ next: () => this.load() });
  }
}
