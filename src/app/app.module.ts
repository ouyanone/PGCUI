import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputComponent } from './input/input.component';
import { MaterialModule } from './material-module';
import { AutocompleteComponent } from './component/autocomplete/autocomplete.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from './component/menubar/menubar.component';
import { HomeComponent } from './component/home/home.component';
import { CardComponent } from './component/card/card.component';
import { SliderComponent } from './component/slider/slider.component';
import { TableComponent } from './component/table/table.component';
import { HttpClientModule } from '@angular/common/http';
import { FormdesignComponent } from './component/formdesign/formdesign.component';
import { PopupComponent } from './component/popup/popup.component';
import { AssociateComponent } from './component/associate/associate.component';
import { UserdetailComponent } from './component/userdetail/userdetail.component';
import { PlayerComponent } from './component/player/player.component';
import {NgOptimizedImage} from "@angular/common";
import { AgGridAngular } from 'ag-grid-angular';
import { GhinSyncComponent } from './component/ghin-sync/ghin-sync.component';
import { EditPlayerComponent } from './component/edit-player/edit-player.component';
import { GameplanComponent } from './component/gameplan/gameplan.component';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { MatTabsModule } from '@angular/material/tabs';
import {MatGridListModule} from '@angular/material/grid-list';
import { GamerecordComponent } from './component/gamerecord/gamerecord.component';
import { AboutusComponent } from './component/aboutus/aboutus.component';
import { GameruleComponent } from './component/gamerule/gamerule.component';
import { StatisticsComponent } from './component/statistics/statistics.component';
import { DonationComponent } from './component/donation/donation.component';
import { GameinputComponent } from './component/gameinput/gameinput.component';
import { PhotosComponent } from './component/photos/photos.component';



@NgModule({
  declarations: [
    AppComponent,
    InputComponent,
    AutocompleteComponent,
    MenubarComponent,
    HomeComponent,
    CardComponent,
    SliderComponent,
    TableComponent,
    FormdesignComponent,
    PopupComponent,
    AssociateComponent,
    UserdetailComponent,
    PlayerComponent,
    GhinSyncComponent,
    EditPlayerComponent,
    GameplanComponent,
    GamerecordComponent,
    AboutusComponent,
    GameruleComponent,
    StatisticsComponent,
    DonationComponent,
    GameinputComponent,
    PhotosComponent
 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatTabsModule,
    AgGridAngular,
    NgOptimizedImage,
    BrowserAnimationsModule,
    MaterialModule,
    AngularDualListBoxModule,
    MatGridListModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
