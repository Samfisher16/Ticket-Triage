import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="card" (ngSubmit)="submit()" #f="ngForm">
      <h2>New ticket</h2>

      <label>Title
        <input name="title" [(ngModel)]="title" maxlength="200" required
               placeholder="e.g. Cannot log in to the VPN" />
      </label>

      <label>Description
        <textarea name="description" [(ngModel)]="description" rows="4" maxlength="4000" required
                  placeholder="What happened? What did you expect?"></textarea>
      </label>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <button type="submit" [disabled]="f.invalid || loading()">
        {{ loading() ? 'Triaging with AI…' : 'Create ticket' }}
      </button>
    </form>
  `,
  styles: `
    .card { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    h2 { margin: 0 0 12px; font-size: 18px; }
    label { display: block; margin-bottom: 12px; font-size: 14px; font-weight: 600; }
    input, textarea {
      display: block; width: 100%; margin-top: 4px; padding: 8px 10px;
      border: 1px solid #cbd2d9; border-radius: 6px; font: inherit; font-weight: 400;
    }
    button {
      background: #2563eb; color: #fff; border: 0; padding: 9px 18px; border-radius: 6px;
    }
    button:disabled { background: #9ab4ec; cursor: not-allowed; }
    .error { color: #b91c1c; margin: 0 0 12px; font-size: 14px; }
  `,
})
export class TicketFormComponent {
  private tickets = inject(TicketService);

  created = output<void>();

  title = '';
  description = '';
  loading = signal(false);
  error = signal('');

  submit(): void {
    this.loading.set(true);
    this.error.set('');
    this.tickets.create({ title: this.title, description: this.description }).subscribe({
      next: () => {
        this.title = '';
        this.description = '';
        this.loading.set(false);
        this.created.emit();
      },
      error: (e) => {
        this.error.set(e.error?.error ?? 'Could not create the ticket. Is the backend running?');
        this.loading.set(false);
      },
    });
  }
}
