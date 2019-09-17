import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { query } from '@angular/animations';

@Injectable()
export class AuthService {

  constructor(private db: AngularFireDatabase, private angAuth: AngularFireAuth, private router: Router, private toastr: ToastrService) {
    this.onAuthService();
  }

  createUser(data) {
    let dbRef = this.db;
    let dataObj = data;
    this.angAuth.auth.createUserWithEmailAndPassword(data.email, data.password)
      .then(function (response) {
        if (response) {
          console.log("Inserting to DB");
          delete dataObj.password;
          let userid = response.user.uid;
          let basePath = "/Users/" + userid;
          const obj = dbRef.database.ref(basePath);
          obj.set(dataObj);
          console.log("Inserted!");
          this.showToast('Signup successful', '', 2);
        }
      }.bind(this))
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        this.showToast('Signup Failed', error, 1);
        // ...
      }.bind(this));
    this.verifyUser();
  }

  updateProfile(userID, data) {
    let basePath = "/Users/" + userID;
    const obj = this.db.database.ref(basePath);
    obj.update(data);
    console.log("Updated!");
    this.showToast('Profile updated', '', 2);
  }

  resetProfile(email) {
    this.angAuth.auth.sendPasswordResetEmail(email).then(function () {
      console.log("Sent");
      this.showToast('E-mail has been sent', '', 2);
    }.bind(this))
      .catch(function (error) {
        console.log(error);
        this.showToast('Failed to send an E-mail', error, 1);
      }.bind(this));
  }

  onAuthService(): Observable<any> {
    if (this.angAuth.user) {
      this.angAuth.authState.subscribe(user => {
        if (user) {
          console.log("Here is " + user.uid + " With Route: " + this.router.url);
          //if (this.router.url == '/home')
          //this.router.navigate(['index']);
        }
      })
    } else {
      this.router.navigate(['home']);
    }
    return this.angAuth.authState;
  }

  onAuthServiceProfile(): Observable<any> {
    return this.angAuth.user;
  }

  login(data) {
    this.angAuth.auth.signInWithEmailAndPassword(data.email, data.password)
      .then(function (response) {
        console.log("Logged In " + response.user.email);
        this.showToast('Login successful', '', 2);
        //this.router.navigate(['home']);
      }.bind(this))
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        this.showToast('Login failed', error, 1);
        // ...
      }.bind(this));
  }

  logout() {
    this.router.navigate(['home']);
    console.log("Logging out " + this.angAuth.auth.currentUser.email);
    this.angAuth.auth.signOut().then(function () {
      console.log("Logged out!");
      this.showToast("Successfully logged out", "", 2);
    }.bind(this))
      .catch(function (error) {
        console.log("Error logging out");
        this.showToast("Error in logging out", error, 1);
      }.bind(this))
  }

  verifyUser() {
    this.angAuth.authState.subscribe(user => {

      if (user && !user.emailVerified) {
        console.log("Sending verification to " + user.email);
        user.sendEmailVerification().then(function () {
          console.log("Sent");
          this.showToast('Verification E-mail Sent', '', 2);
        })
          .catch(function (error) {
            console.log(error.message);
          });
      } else {
        if (user && user.emailVerified)
          console.log("Verified user " + user.email);
      }
    });
  }


  async getUserDetails(userUID) {
    console.log("User details for " + userUID);
    let basePath = "/Users/" + userUID
    return await this.db.database.ref(basePath).once('value').then(function (snapshot) {
      return snapshot.val();
    });
  }

  getAvailableTags(): Observable<any[]> {
    let basePath = "/Tags/";
    return this.db.list(basePath).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  submitData(userID, data) {
    let basePath = "/Users/" + userID;
    var result = false;
    const obj = this.db.database.ref(basePath);
    obj.update(data).then(function () {
      console.log("Inserted!");
      this.showToast('Profile updated', '', 2);
      this.router.navigate(['index']);
    }.bind(this));
  }

  insertQuestion(data) {
    console.log("Inserting Question to DB");
    let userid = data.uid;
    let basePath = "/Tags/ " + data.tag;
    const obj = this.db.database.ref(basePath);
    obj.push(data);
    this.showToast('Question asked', '', 2);
    console.log("Inserted!");
  }

  getQuestions(tag): Observable<any[]> {
    //console.log("Call for " + tag);
    let basePath = "Tags/ " + tag;
    //console.log("Basepath: " + basePath);
    return this.db.list(basePath).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  sendAnswer(tag, qkey, data) {
    let basePath = "/Tags/ " + tag + "/" + qkey + "/answers/";
    const obj = this.db.database.ref(basePath);
    obj.push(data);
    let updateBasePath = "/Tags/ " + tag + "/" + qkey + "/";
    this.db.database.ref(updateBasePath).transaction(function (data) {
      data.totalAns = data.totalAns + 1;
      return data;
    })
    this.showToast('Answer added', '', 2);
    console.log("Answer Inserted!");
  }

  getAnswers(tag, qkey): Observable<any[]> {
    //console.log("Call for Answer to Tag " + tag);
    let basePath = "/Tags/ " + tag + "/" + qkey + "/answers/";
    console.log("Basepath Answers: " + basePath);
    return this.db.list(basePath).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  updateVote(tag, qkey, akey, count, userID, data) {
    let updateBasePath = "/Tags/ " + tag + "/" + qkey + "/answers/" + akey + "/voters/";
    let obj = this.db.database.ref(updateBasePath);
    obj.update(data);
    let basePath = "/Tags/ " + tag + "/" + qkey + "/answers/" + akey;
    this.db.database.ref(basePath).transaction(function (data) {
      data.votes = data.votes + count;
      return data;
    })
  }

  getThisQuestion(tag, qkey) {
    //console.log("Call for " + tag);
    let basePath = "Tags/ " + tag + "/" + qkey + "/";
    console.log("Basepath: " + basePath);
    this.db.database.ref(basePath).on('value', function (snapshot) {
      return snapshot.val();
      console.log("S: " + snapshot.val());
    });
  }

  deleteThisAnswer(tag, qkey, akey) {
    let basePath = "/Tags/ " + tag + "/" + qkey + "/answers/" + akey;
    this.db.database.ref(basePath).remove();
    let updateBasePath = "/Tags/ " + tag + "/" + qkey + "/";
    this.db.database.ref(updateBasePath).transaction(function (data) {
      data.totalAns = data.totalAns - 1;
      return data;
    })
    this.showToast('Answer deleted', '', 2);
  }

  deleteThisQuestion(tag, qkey) {
    let basePath = "/Tags/ " + tag + "/" + qkey;
    this.db.database.ref(basePath).remove();
    this.showToast('Question deleted', '', 2);
    console.log("Deleted");
  }

  showToast(title, msg, type) {
    if (type == 1)
      this.toastr.error(msg, title);
    else if (type == 2)
      this.toastr.success(msg, title);
    else if (type == 3)
      this.toastr.info(msg, title);
    else if (type == 4)
      this.toastr.warning(msg, title);
  }

}
