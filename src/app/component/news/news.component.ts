import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColDef } from 'ag-grid-community';
import { PlayerService } from 'src/app/services/player.service';
import { AuthService } from 'src/app/services/auth.service';
import { NewsRepresentation } from 'src/app/services/api/models/news-representation';
import { NewsDialogComponent } from './news-dialog.component';
import { ConfirmDeleteDialogComponent } from '../donation/confirm-delete-dialog.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  newsData: NewsRepresentation[] = [];
  isLoggedIn = false;

  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', flex: 3 },
    { field: 'publishDate', headerName: 'Date', flex: 1 },
    { field: 'isActive', headerName: 'Active', width: 90,
      valueFormatter: (p: any) => p.value ? 'Yes' : 'No' },
    { headerName: 'Actions', width: 160, sortable: false,
      cellRenderer: () => `<button class="pgc-btn-edit">Edit</button><button class="pgc-btn-delete">Delete</button>`
    }
  ];

  defaultColDef: ColDef = { sortable: true, filter: true };

  constructor(
    private service: PlayerService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.getStatus().subscribe(s => { this.isLoggedIn = s.loggedIn; });
    this.load();
  }

  load() {
    this.service.getAllNews().subscribe(data => { this.newsData = data; });
  }

  onCellClicked(event: any) {
    if (!this.isLoggedIn) return;
    const btn = event.event?.target as HTMLElement;
    if (btn?.classList.contains('pgc-btn-edit')) {
      this.openDialog(event.data);
    } else if (btn?.classList.contains('pgc-btn-delete')) {
      this.confirmDelete(event.data);
    }
  }

  openDialog(news: NewsRepresentation | null) {
    this.dialog.open(NewsDialogComponent, { data: news, width: '560px' })
      .afterClosed().subscribe(r => { if (r === 'saved') this.load(); });
  }

  confirmDelete(news: NewsRepresentation) {
    this.dialog.open(ConfirmDeleteDialogComponent, { data: { name: news.title } })
      .afterClosed().subscribe(confirmed => {
        if (confirmed && news.id) {
          this.service.deleteNews(news.id).subscribe(() => this.load());
        }
      });
  }
}
