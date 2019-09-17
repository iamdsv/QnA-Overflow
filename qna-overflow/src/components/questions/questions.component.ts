import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../app/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import 'tinymce';
declare var tinymce: any;

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  user: any;
  qtags = [];
  questions: Observable<any[]>;
  WriteA: Observable<any[]>;
  answers: Observable<any[]>;
  userID: any;
  email: any;
  init: any;
  name: any;
  interest = [];
  showBox: boolean = false;
  display = 'none';
  currTag: any;
  currQKey: any;
  answer: any;
  public Qtitle: string = '';
  status: boolean = false;
  emailVerified: any;
  voter: any;
  currAns: any;
  voteEvent = '';
  writeATitle = '';
  writeAQ = '';
  writeAABy = '';
  writeATime = '';
  questionListTitle = [];
  questionListKey = [];
  questionListQuestion = [];
  questionListTag = [];
  questionListName = [];
  questionListTime = [];
  voteList = [];
  formControlValue = '';
  keyword: string;
  location: any;
  anslist = [];
  once: boolean = true;

  constructor(private authservice: AuthService, private router: Router, private route: ActivatedRoute, private loc: Location) {
    tinymce.baseURL = 'assets/tinymce';
    this.location = router.url;
  }
  ngOnInit() {
    //Load Questions
    this.user = this.onAuthService();
    this.user.subscribe(user => {
      if (user) {
        document.getElementById("load").innerHTML = 'Loading...';
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
            if (this.init) this.name = udata.name;
            document.getElementById("load").innerHTML = '';
            console.log("User Email: " + udata.email + " Init: " + udata.init + " Interest: " + udata.interest);
            for (var i = 0; i < this.interest.length; i++) {
              console.log(i);
              this.questions = this.getQuestions(this.interest[i]);
              this.questions.subscribe(ques => {
                ques.forEach(element => {
                  this.questionListTitle.push(element.title);
                  this.questionListKey.push(element.key);
                  this.questionListQuestion.push(element.question);
                  this.questionListTag.push(element.tag);
                  this.questionListName.push(element.name);
                  this.questionListTime.push(element.timestamp);
                  //console.log(element.title);
                });

              })
              this.qtags.push(this.questions);
            }
          }.bind(this));
      } else {
        this.router.navigate(['home'], { queryParams: {} });
      }
    });
    setTimeout(function () {
      this.route.queryParams.subscribe(params => {
        let qkey = params['q'];
        let index = params['index'];
        let tag = params['tag'];
        let qt = params['qt'];
        let qques = params['qques'];
        let qasked = params['ask'];
        let time = params['time'];
        console.log("Qkey: " + qkey + " Index: " + index, " Tag: " + tag);
        if (qkey != undefined) {
          this.openModal(tag, qkey, qt, qques, 1, qasked, time);
        }
      });
    }.bind(this), 1000);
  }

  getUserDetails(userUID) {
    return this.authservice.getUserDetails(userUID);
  }
  onAuthService() {
    return this.authservice.onAuthService();
  }

  getQuestions(tag) {
    return this.authservice.getQuestions(tag);
  }

  showAnsBox() {
    setTimeout(function () {
      this.showBox = !this.showBox;
    }.bind(this), 100);
  }

  openModal(tag, qkey, qtitle, qques, index, askedBy, timestamp) {
    console.log(this.questionListTitle);
    this.display = 'block';
    this.currQKey = qkey;
    this.writeATitle = qtitle;
    this.writeAQ = qques;
    this.writeAABy = askedBy;
    this.writeATime = timestamp;
    if (index != 1) {
      this.currTag = this.interest[tag];
      this.answers = this.getAnswers(this.interest[tag], qkey);
      this.getAnswers(this.interest[tag], qkey).subscribe(ans => {
        //console.log(ans);
        ans.forEach(a => {
          this.anslist.push(a.answer);
          console.log("Ans: " + a.answer);
          if (a.voters != 0) {
            console.log(a.voters);
            let flag = 0;
            for (let key in a.voters) {
              console.log('key: ' + key + ',  value: ' + a.voters[key]);
              if (key == this.userID) {
                this.voteList.push(a.voters[key]);
                flag = 1;
                break;
              }
            }
            if (!flag) this.voteList.push(0);
          } else {
            this.voteList.push(0);
          }
          console.log(a.voters);
        })
      })
    }
    else {
      this.currTag = tag;
      this.answers = this.getAnswers(tag, qkey);
      this.getAnswers(tag, qkey).subscribe(ans => {
        //console.log(ans);
        ans.forEach(a => {
          console.log("Ans: " + a.answer);
          this.anslist.push(a.answer);
          if (a.voters != 0) {
            console.log(a.voters);
            let flag = 0;
            for (let key in a.voters) {
              console.log('key: ' + key + ',  value: ' + a.voters[key]);
              if (key == this.userID) {
                this.voteList.push(a.voters[key]);
                flag = 1;
                break;
              }
            }
            if (!flag) this.voteList.push(0);
          } else {
            this.voteList.push(0);
          }
          console.log(a.voters);
        })
      })
    }
    console.log("List: " + this.voteList);
    console.log("Tag: " + tag + " Question Key: " + qkey + " Index: " + index);
  }
  onCloseHandled() {
    this.display = 'none';
    if (this.location == '/questions')
      this.router.navigate(['questions'], { queryParams: {} });
    else if (this.location == '/myquestions')
      this.router.navigate(['myquestions'], { queryParams: {} });
    else if (this.location == '/unanswered')
      this.router.navigate(['unanswered'], { queryParams: {} });
    else if (this.location == '/myanswers')
      this.router.navigate(['myanswers'], { queryParams: {} });
    else this.router.navigate(['home'], { queryParams: {} });
  }
  getAnswers(tag, qkey) {
    return this.authservice.getAnswers(tag, qkey);
  }

  sendAnswer() {
    const data = {
      answer: this.answer,
      uid: this.userID,
      name: this.name,
      timestamp: Date.now(),
      votes: 0,
      voters: 0
    }
    this.authservice.sendAnswer(this.currTag, this.currQKey, data);
    this.answer = '';
  }

  upvoteEvent(answer, key, index) {
    let list = this.voteList;
    let i = this.anslist.indexOf(answer);
    let v = list[i] + 1;
    const data = {
      [this.userID]: v
    }
    this.updateVote(this.currTag, this.currQKey, key, 1, this.userID, data);
    this.voteList[i] += 1;
    console.log(answer.on + " Key: " + key);
  }

  downvoteEvent(answer, key, index) {
    let list = this.voteList;
    let i = this.anslist.indexOf(answer);
    let v = list[i] - 1;
    const data = {
      [this.userID]: v
    }
    this.updateVote(this.currTag, this.currQKey, key, -1, this.userID, data);
    this.voteList[i] -= 1;
    console.log(answer.on + " Key: " + key);
  }

  updateVote(tag, qkey, akey, count, userID, data) {
    this.authservice.updateVote(tag, qkey, akey, count, userID, data);
  }
  deleteThisAnswer(akey) {
    console.log("Deleting Akey: " + akey + " with tag: " + this.currTag + " Qkey: " + this.currQKey);
    this.authservice.deleteThisAnswer(this.currTag, this.currQKey, akey);
  }

  deleteThisQuestion(tag, qkey) {
    console.log("Deleting with tag: " + tag + " Qkey: " + qkey);
    this.authservice.deleteThisQuestion(tag, qkey);
  }
  suggestions: string[] = [];
  typeahead: FormControl = new FormControl();

  suggest() {
    if (this.typeahead.value)
      this.suggestions = this.questionListTitle
        .filter(c => c.toLowerCase().includes(this.typeahead.value.toLowerCase()))
        .slice(0, 5);
    else this.suggestions.length = 0;
  }

  clicked(s) {
    let i = this.questionListTitle.indexOf(s);
    console.log("Clicked Key" + i + " " + this.questionListKey[i] + " Tag: " + this.questionListTag[i]);
    let query = "q=" + this.questionListKey[i] + "&index=" + i + "&tag=" + this.questionListTag[i] + "&qt=" + this.questionListTitle[i] + "&qques=" + this.questionListQuestion[i];
    this.loc.replaceState(this.location, query);
    this.openModal(this.questionListTag[i], this.questionListKey[i], this.questionListTitle[i], this.questionListQuestion[i], 1, this.questionListName[i], this.questionListTime[i]);
  }

  voteStatus(answer) {
    let list = this.voteList;
    let index = this.anslist.indexOf(answer);
    return list[index];
  }

  doneOnce() {
    this.once = false;
  }

  resetDone() {
    this.once = true;
  }
}
