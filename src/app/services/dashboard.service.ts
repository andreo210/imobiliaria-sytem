import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  total_properties: number;
  total_clients: number;
  active_contracts: number;
  monthly_revenue: number;
}

export interface UpcomingVisit {
  id: number;
  property_title: string;
  client_name: string;
  date: string;
  status: string;
}

export interface RecentContract {
  id: number;
  contract_number: string;
  client_name: string;
  property_title: string;
  status: string;
  created_at: string;
}

export interface RecentProperty {
  id: number;
  title: string;
  price: number;
  status: string;
  type: string;
}

export interface DashboardData {
  stats: DashboardStats;
  upcoming_visits: UpcomingVisit[];
  recent_contracts: RecentContract[];
  recent_properties: RecentProperty[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/stats`);
  }
}
