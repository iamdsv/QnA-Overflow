import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../app/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TagInputComponent } from 'angular2-tag-input';
import { Location } from '@angular/common';
import { AppComponent } from '../../app/app.component';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public user: Observable<any>;
  angForm: FormGroup;
  angFormReset: FormGroup;
  angFormStarted: FormGroup;
  userID: any;
  email: any;
  init: any;
  name: any;
  branch: any;
  interest = [];
  tags = [];
  emailVerified: any;
  availableTags: Observable<any[]>;
  updateInterest = [];
  constructor(private authservice: AuthService, private app: AppComponent, private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private location: Location) {
    this.createForm();
    setTimeout(function () {
      this.showHide = true;
    }.bind(this), 500);
  }

  createForm() {
    this.angForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.angFormReset = this.fb.group({
      remail: ['', Validators.required]
    });
    this.angFormStarted = this.fb.group({
      name: ['', Validators.required],
      branch: ['', Validators.required],
      items: ['', Validators.required],
    });
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
            this.interest = udata.interest;
            this.email = udata.email;
            this.init = udata.init;
            this.branch = udata.branch;
            if (this.init) this.name = udata.name;
            this.availableTags = this.getAvailableTags();
            console.log("User Email: " + udata.email + " Init: " + udata.init + " Interest: " + udata.interest);
          }.bind(this));
      }
    });
  }

  getAvailableTags() {
    return this.authservice.getAvailableTags();
  }

  getUserDetails(userUID) {
    return this.authservice.getUserDetails(userUID);
  }
  onAuthService() {
    return this.authservice.onAuthService();
  }

  createUser(email, password) {
    const dataObj = {
      email: email,
      password: password,
      init: false
    };
    this.authservice.createUser(dataObj);
    this.login(dataObj.email, dataObj.password);
  }

  login(email, password) {
    const dataObj = {
      email: email,
      password: password
    };
    setTimeout(function () {
      this.authservice.login(dataObj);
    }.bind(this), 500);
  }

  updateProfile() {
    this.updateInterest.length = 0;
    this.interest.forEach(element => {
      this.updateInterest.push(this.toTitleCase(element));
    })
    const data = {
      interest: this.updateInterest
    }
    this.authservice.updateProfile(this.userID, data);
    this.ngOnInit();
  }

  reset(email) {
    this.authservice.resetProfile(email);
  }

  logout() {
    console.log("Logging out");
    this.authservice.logout();
  }

  verifyUser() {
    this.authservice.verifyUser();
  }

  submitData(name, branch) {
    console.log("Name: " + name + " Branch: " + branch + "Items: " + this.tags);
    this.tags.forEach(element => {
      this.updateInterest.push(this.toTitleCase(element));
    })
    const dataObj = {
      name: name,
      branch: branch,
      init: true,
      interest: this.updateInterest
    };
    this.authservice.submitData(this.userID, dataObj);
    setTimeout(function () {
      this.init = true;
      this.name = name;
      this.branch = branch;
      this.app.ngOnInit();
    }.bind(this), 100);
  }

  toTitleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  }
}
