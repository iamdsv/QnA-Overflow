# QnA Overflow
Personalized platform for Q&amp;A at IIT Kanpur
* ***Motivation:***
    * No common personalized platform for Q&A at IIT-K
    * Replacement for Piazza
    * Previous year questions can help future students
      
* ***Technologies used:***
    * Front-end: AngularJS, HTML, CSS
    * Back-end: Typescript
    * Database: Firebase (NoSQL)
    * Editor: Tinymce (with LaTeX & Code-snippet support)
      
* ***Development:***
    * We followed process similar to Agile
    * We had 3 iterations, with version releases dated November 15th, 18th and 21st
      
* ***Challenges:***
    * Realtime Question/Answer fetching
    * Updation time of upvotes/downvotes
    * New tags entered by people were absured sometimes
      
* ***How we tackled:***
    * Used Observable push to propogate changes in realtime
    * We maintained a local array for votes and they are updated in DB in async fashion
    * We have created our own standardized function which converts all tags into common format
      
* ***Functionalities:***
    * E-mail verification
    * Add/Delete Questions/Answers (with LaTeX & Code-snippet support)
    * Upvote/Downvote Answers
    * Search bar
    * Tags to follow
    * Shareable Q/A links
      
* ***Load Distribution:***
    * Server side: 
        ▪ Authentication
        ▪ Question and Answer fetching (via Observable push)
        ▪ Managing votes in async fashion
    * Client side:
        ▪ Filtering and ordering of questions and answers
        ▪ Rendering Single Page Application with multiple views
        
* ***Basic analytics:***
    * Maximum concurrent users at a time were 8
    * Peak DB server load was 2%, it can handle 100 concurrent users at a time
      
* ***Extensions:***
    * Badges to be earned
    * Special access for instructors
    * E-mail notification
    * Questions for you (using ML)
    * Android/iOS application
