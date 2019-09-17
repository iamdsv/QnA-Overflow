import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { IndexComponent } from '../components/index/index.component';
import { QuestionsComponent } from '../components/questions/questions.component';
export const appRoutes: Routes = [
  {
    path: '', 
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'index',
    component: IndexComponent
  },
  {
    path: 'questions',
    component: QuestionsComponent,
  },
  {
    path: 'myquestions',
    component: QuestionsComponent,
  },
  {
    path: 'unanswered',
    component: QuestionsComponent,
  },
  {
    path: 'myanswers',
    component: QuestionsComponent,
  }
];