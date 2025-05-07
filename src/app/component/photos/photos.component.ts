import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HttpHeaders} from "@angular/common/http";
 

const URL = 'http://localhost:3000/fileupload/';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent {


  fileName = '';

  photourl:any= '';

  constructor(private http: HttpClient) {}

  onFileSelected(event:any) {
    console.log("on file selected...");
      const file:File = event.target.files[0];

      const headers = new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'responseType' : 'text' 
      });

      if (file) {

          this.fileName = file.name;

          const lastModified = file.lastModified;

          const formData = new FormData();

          formData.append("file", file, file.name);
          formData.append("lastModified", String(lastModified));

          const upload$ = this.http.post("webapi/admin/upload", formData, {responseType: 'text'});

          upload$.subscribe(
            result => {
              console.log("result="+result);
              this.photourl = result;
            
          });
      }

      console.log("photourl="+this.photourl);
  }

}
