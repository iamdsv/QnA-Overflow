import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subject } from 'rxjs/Subject'
import 'tinymce';
import { AngularFireList } from '@angular/fire/database';
import { element } from '@angular/core/src/render3';
declare var tinymce: any;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  angForm: FormGroup;
  user: any;
  userID: any;
  email: any;
  init: any;
  name: any;
  branch: any;
  emailVerified: any;
  public content: string = '';
  public answer: string = '';
  public title: string = '';
  showHide: boolean;
  tags = [];
  interest = [];
  qtag = [];
  availableTags: Observable<any[]>;
  @ViewChild('gettingStarted') el: ElementRef;

  constructor(private authservice: AuthService, private route: ActivatedRoute, private fb: FormBuilder, private editor: EditorModule, private router: Router) {
    tinymce.baseURL = 'assets/tinymce';
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
            console.log("User Email: " + udata.email + " Init: " + udata.init + " Interest: " + udata.interest);
          }.bind(this));
      } else {
        this.router.navigate(['home'], { queryParams: {} });
      }
    });

  }

  onAuthService() {
    return this.authservice.onAuthService();
  }

  getAvailableTags() {
    return this.authservice.getAvailableTags();
  }

  getUserDetails(userUID) {
    return this.authservice.getUserDetails(userUID);
  }

  getContent() {
    setTimeout(function () {
      this.answer = this.content;
    }.bind(this), 240);
    if (this.qtag.length > 1) {
      this.authservice.showToast("Only one tag is allowed", "", 1);
    }
    else {
      let tag = this.toTitleCase(this.qtag[0]);
      const data = {
        title: this.title,
        question: this.content,
        uid: this.userID,
        name: this.name,
        tag: tag,
        timestamp: Date.now(),
        answers: 0,
        totalAns: 0
      }
      this.authservice.insertQuestion(data);
      this.router.navigate(['myquestions']);
    }
  }

  toTitleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  }
}