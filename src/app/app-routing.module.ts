import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutocompleteComponent } from './component/autocomplete/autocomplete.component';
import { InputComponent } from './input/input.component';
import { HomeComponent } from './component/home/home.component';
import { CardComponent } from './component/card/card.component';
import { SliderComponent } from './component/slider/slider.component';
import { TableComponent } from './component/table/table.component';
import { FormdesignComponent } from './component/formdesign/formdesign.component';
import { AssociateComponent } from './component/associate/associate.component';
import { PlayerComponent } from './component/player/player.component';
import { GhinSyncComponent } from './component/ghin-sync/ghin-sync.component';
import { EditPlayerComponent } from './component/edit-player/edit-player.component';
import { GameplanComponent } from './component/gameplan/gameplan.component';
import { GamerecordComponent } from './component/gamerecord/gamerecord.component';
import { AboutusComponent } from './component/aboutus/aboutus.component';
import { DonationComponent } from './component/donation/donation.component';
import { GameruleComponent } from './component/gamerule/gamerule.component';
import { StatisticsComponent } from './component/statistics/statistics.component';
import { PhotosComponent } from './component/photos/photos.component';

const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'autocomplete',component:AutocompleteComponent},
  {path:'input',component:InputComponent},
  {path:'card',component:CardComponent},
  {path:'slider',component:SliderComponent},
  {path:'table',component:TableComponent},
  {path:'form',component:FormdesignComponent},
  {path:'associate',component:AssociateComponent},
  {path:'player',component:PlayerComponent},
  {path:'editplayer',component:EditPlayerComponent},
  {path:'ghinsync',component:GhinSyncComponent},
  {path:'gameplan',component:GameplanComponent},
  {path:'gamerecord',component:GamerecordComponent},
  {path:'aboutus',component:AboutusComponent},
  {path:'donation',component:DonationComponent},
  {path:'gamerule',component:GameruleComponent},
  {path:'photos',component:PhotosComponent},
  {path:'statistics',component:StatisticsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
