import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTicketRequest, Status, Ticket } from '../models/ticket';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private baseUrl = '/api/tickets';

  list(status?: Status): Observable<Ticket[]> {
    const url = status ? `${this.baseUrl}?status=${status}` : this.baseUrl;
    return this.http.get<Ticket[]>(url);
  }

  create(req: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, req);
  }

  resolve(id: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}/resolve`, {});
  }
}
