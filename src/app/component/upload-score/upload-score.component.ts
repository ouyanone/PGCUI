import { Component } from '@angular/core';
import { Papa } from "ngx-papaparse";
import { GridOptions } from 'ag-grid-community';
import { ColDef } from 'ag-grid-community';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-upload-score',
  templateUrl: './upload-score.component.html',
  styleUrls: ['./upload-score.component.css']
})
export class UploadScoreComponent {




  gridOptions: GridOptions = {
    columnDefs: [],
    rowData: [],
  };


  scoreColumnDefs: ColDef[] = [];
  scoreRowData: any[] = [];


  constructor(private papa: Papa, private service: PlayerService) {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    console.log('file='+file);
    if (file) {

      this.parseCsvFile(file);

    }
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
    console.log('222');
    if (!fields) {
      return [];
    }
    return fields.map(field => ({ headerName: field, field: field, editable: true }));
  }


  onSubmit(event: any): void {
   console.log('onSubmit submitted'+this.scoreRowData);
   console.log(' onSubmit aaa');
   this.service.submitScores(this.scoreRowData).subscribe(item => {
   
    console.log('item==='+item);
  });;
   console.log('onSubmit bbb');
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
