import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../app/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'qna-overflow';
  user: Observable<any>;
  userID: any;
  email: any;
  init: any;
  name: any;
  branch: any;
  emailVerified: any;

  constructor(private authservice: AuthService, private router: Router) {

  }

  ngOnInit() {
    this.user = this.onAuthService();
    this.user.subscribe(user => {
      if (user) {
        this.userID = user.uid;
        this.emailVerified = user.emailVerified;
        this.getUserDetails(user.uid)
          .then(function (response) {
            return JSON.stringify(response);
          })
          .then(function (data) {
            const udata = JSON.parse(data);
            this.email = udata.email;
            this.init = udata.init;
            this.interest = udata.interest;
            if (this.init) this.name = udata.name;
            this.availableTags = this.getAvailableTags();
            console.log("App");
            console.log("User Email: " + udata.email + " Init: " + udata.init + " Interest: " + udata.interest);
          }.bind(this));
      } else {
        this.router.navigate(['home'], { queryParams: {} });
      }
    });
  }

  getUserDetails(userUID) {
    return this.authservice.getUserDetails(userUID);
  }
  onAuthService(): Observable<any> {
    return this.authservice.onAuthServiceProfile();
  }
  getAvailableTags() {
    return this.authservice.getAvailableTags();
  }

  logout(): void {
    console.log("Logging out");
    this.authservice.logout();
  }
}
