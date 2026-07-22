import { Component, OnInit } from '@angular/core';
import { Papa } from "ngx-papaparse";
import { GridOptions } from 'ag-grid-community';
import { ColDef } from 'ag-grid-community';
import { PlayerService } from 'src/app/services/player.service';
import { EventRepresentation } from 'src/app/services/api/models/event-representation';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-upload-score',
  templateUrl: './upload-score.component.html',
  styleUrls: ['./upload-score.component.css']
})
export class UploadScoreComponent implements OnInit {




  gridOptions: GridOptions = {
    columnDefs: [],
    rowData: [],
  };


  scoreColumnDefs: ColDef[] = [];
  scoreRowData: any[] = [];

  selectedFileName = '';

  // Events the score file can be uploaded to (STARTED status), and the chosen one.
  startedEvents: EventRepresentation[] = [];
  selectedEventId: number | null = null;

  // "Check User" state: the event's roster (normalized names), whether a check
  // has run, and how many uploaded rows don't match a player in the event.
  private eventPlayers: { f: string; l: string }[] = [];
  checked = false;
  unmatchedCount = 0;
  private gridApi: any;

  // Paint rows whose player name isn't found in the selected event.
  rowClassRules = {
    'pgc-row-unmatched': (p: any) => !!p.data?.__unmatched,
  };

  defaultColDef: ColDef = {
    editable: true,
    sortable: true,
    resizable: true,
    minWidth: 56,
  };

  // Column order shared by the CSV header and the XLSX layout (first 23 columns).
  private readonly SCORE_FIELDS = [
    'name', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'f9',
    'h10', 'h11', 'h12', 'h13', 'h14', 'h15', 'h16', 'h17', 'h18', 'b9', 'all18', 'score'
  ];


  constructor(private papa: Papa, private service: PlayerService) {}

  ngOnInit(): void {
    // Load events that are in STARTED status — those are the ones scores upload to.
    this.service.getAllEvent().subscribe((events: EventRepresentation[]) => {
      this.startedEvents = (events || []).filter(e => e.status === 'STARTED');
      // Auto-select when there is exactly one started event.
      if (this.startedEvents.length === 1) {
        this.selectedEventId = this.startedEvents[0].id ?? null;
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    console.log('file=' + file);
    if (file) {
      this.selectedFileName = file.name;
      this.resetCheck();
      const name = (file.name || '').toLowerCase();
      if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
        this.parseXlsxFile(file);
      } else {
        this.parseCsvFile(file);
      }
    }
  }

  // Parse a golf-app score export (.xls/.xlsx). Despite the .xls extension the
  // real content is usually modern XLSX; SheetJS auto-detects both formats.
  // Rows map 1:1 onto SCORE_FIELDS so they feed the same editable grid + submit
  // pipeline as CSV. Per-hole values carry a '+' prefix which is stripped here.
  parseXlsxFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });

        // Player rows start after the header ("HOLE" row) and the following "PAR" row.
        const headerIdx = rows.findIndex(r => String(r[0]).trim().toUpperCase() === 'HOLE');
        const startIdx = headerIdx >= 0 ? headerIdx + 2 : 0;

        const parsed: any[] = [];
        for (let i = startIdx; i < rows.length; i++) {
          const r = rows[i];
          const name = String(r[0] ?? '').trim();
          const gross = String(r[22] ?? '').replace(/\+/g, '').trim();
          // Skip the title/footer/blank rows: a player row has a name and a numeric gross score.
          if (!name || gross === '' || !isFinite(Number(gross))) { continue; }
          const row: any = {};
          this.SCORE_FIELDS.forEach((field, idx) => {
            row[field] = idx === 0 ? name : String(r[idx] ?? '').replace(/\+/g, '').trim();
          });
          parsed.push(row);
        }

        if (parsed.length === 0) {
          console.error('No player rows found in XLSX file.');
          return;
        }
        this.scoreColumnDefs = this.createColumnDefs(this.SCORE_FIELDS);
        this.scoreRowData = parsed;
        this.gridOptions.columnDefs = this.scoreColumnDefs;
        this.gridOptions.rowData = parsed;
      } catch (error) {
        console.error('Error parsing XLSX file:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  parseCsvFile(file: File): void {
    console.log('111');
    this.papa.parse(file, {
      header: true,
      complete: (result) => {
        if (result.data && result.data.length > 0) {
          this.gridOptions.columnDefs = this.createColumnDefs(result.meta.fields);
          this.gridOptions.rowData = result.data;
    
          this.scoreColumnDefs= this.createColumnDefs(result.meta.fields);
          this.scoreRowData= result.data;

          console.log('rowdata='+this.gridOptions.rowData);
        } else {
          console.error('No data found in CSV file.');
        }
      },
      error: (error) => {
        console.log('err');
        console.error('Error parsing CSV file:', error);
      }
    });

      
  }

  createColumnDefs(fields: string[] | undefined): any[] {
    if (!fields) {
      return [];
    }
    return fields.map(field => {
      if (field === 'name') {
        return { headerName: 'Name', field, editable: true, pinned: 'left', width: 140, minWidth: 120 };
      }
      // wider columns for the longer headers so nothing truncates
      const wide = field === 'all18' || field === 'score';
      return {
        headerName: field.toUpperCase(),
        field,
        editable: true,
        width: wide ? 78 : 62,
        headerClass: 'pgc-num-header',
        cellClass: 'pgc-num-cell',
      };
    });
  }


  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  // Clear any prior "Check User" result (called on new file or event change).
  private resetCheck(): void {
    this.checked = false;
    this.unmatchedCount = 0;
    this.eventPlayers = [];
    this.scoreRowData.forEach(row => { row.__unmatched = false; });
    if (this.gridApi) { this.gridApi.redrawRows(); }
  }

  // Changing the target event invalidates a previous check (different roster).
  onEventChange(): void {
    this.resetCheck();
  }

  // Split a name the same way the backend does: first token = first name,
  // second token = last name (case-insensitive), remaining tokens ignored.
  private isMatched(name: string): boolean {
    const tokens = (name || '').split(' ');
    const f = (tokens[0] || '').toLowerCase();
    const l = (tokens.length > 1 ? tokens[1] : '').toLowerCase();
    return this.eventPlayers.some(p => p.f === f && p.l === l);
  }

  // "Check User": load the selected event's roster, then flag any uploaded row
  // whose name doesn't match a player in that event.
  checkUsers(): void {
    if (this.selectedEventId == null) {
      alert('Please select the event first.');
      return;
    }
    if (!this.scoreRowData.length) {
      alert('Please load a score file first.');
      return;
    }
    this.service.getLatestPlayerScores(this.selectedEventId).subscribe((scores: any[]) => {
      this.eventPlayers = (scores || [])
        .map(s => s.player)
        .filter(p => !!p)
        .map(p => ({ f: (p.fName || '').toLowerCase(), l: (p.lName || '').toLowerCase() }));
      this.recomputeMatches();
    });
  }

  // Re-evaluate every row against the loaded roster and refresh the grid.
  private recomputeMatches(): void {
    let unmatched = 0;
    this.scoreRowData.forEach(row => {
      row.__unmatched = !this.isMatched(row.name);
      if (row.__unmatched) { unmatched++; }
    });
    this.unmatchedCount = unmatched;
    this.checked = true;
    if (this.gridApi) { this.gridApi.redrawRows(); }
  }

  // When a name is edited in the grid, re-check live (if a check has run).
  onCellValueChanged(): void {
    if (this.checked && this.eventPlayers.length) {
      this.recomputeMatches();
    }
  }

  onSubmit(event: any): void {
   if (this.selectedEventId == null) {
     alert('Please select the event to upload the scores to.');
     return;
   }
   // Unmatched rows are simply skipped by the backend; let the admin proceed
   // with the matched players after a quick heads-up.
   if (this.checked && this.unmatchedCount > 0) {
     const proceed = confirm(
       this.unmatchedCount + ' player(s) are not matched to this event and will be skipped. '
       + 'Submit the matched players anyway?');
     if (!proceed) { return; }
   }
   console.log('onSubmit submitted to event ' + this.selectedEventId, this.scoreRowData);
   this.service.submitScores(this.scoreRowData, this.selectedEventId).subscribe(item => {
    console.log('item==='+item);
  });
  }


  onBoardingPlayer(event: any): void {
    console.log('onBoardingPlayer submitted'+this.scoreRowData);
    console.log('onBoardingPlayer...');
    this.service.onboardPlayerScores(this.scoreRowData).subscribe(item => {
    
     console.log('item==='+item);
   });;
    console.log('onBoardingPlayer done');
   }

}
