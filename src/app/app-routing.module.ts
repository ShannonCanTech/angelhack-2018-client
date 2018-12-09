import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AskComponent } from './ask/ask.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { TrainComponent } from './train/train.component';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'ask', component: AskComponent },
  { path: 'train', component: TrainComponent },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
