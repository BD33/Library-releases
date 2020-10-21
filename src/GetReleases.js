import { Octokit } from "@octokit/core";
import './App.css';
import React, { Component } from 'react'
import ReactTimeAgo from 'react-time-ago'


//API calling to Git and Local Storage
const octokit = new Octokit();
var store = require('store')
const list = [];

class GetReleases extends Component {

  constructor(props) {
      super(props);
      this.state = {
          value: '',
          result: '',
          reposDate: '',
          owner: '',
          repoName: '',
          hasViewed: '',
          message: '',
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

  }
    //Load local storage on page load
    componentDidMount() {
      const list = store.get('repos');
    }


  callApi(owner, repo){
   octokit.request('GET /repos/{owner}/{repo}/commits/master', {
      owner: owner,
      repo: repo
    }).then(
      (response) => {    
        //Get time and Date (For some reason the deafult time for Git's API is in GMT time, couldn't find out how to change it)
        var time = response.data.commit.author.date.substr(response.data.commit.author.date.length - 9);
        time = time.substr(0, time.length - 1);
        var date = response.data.commit.author.date.substring(0,response.data.commit.author.date.indexOf("-") + 6);
        date = date.replace(/-/g, "/");
        date = date + " " + time;
     
        this.setState({reposDate : date, message : response.data.commit.message});
         //Push the state to a temp list 
        list.push(this.state);
        //Clear the current local Storage 
        store.clearAll();
        //Add updated State to local Storage
        store.set('repos', list);

        
      }
    );

  }

    handleChange(event) { this.setState({ value: event.target.value }); }
    handleSubmit(event) {
      //Parse URL and grap the owner and the repo
       var params = this.state.value.split("/").slice(-2).join("/");
       var owner = params.substring(0, params.indexOf('/'));
       var repo = params.substring(params.indexOf('/') + 1, params.length);
       this.setState({owner: owner});
       this.setState({repoName: repo});
       this.setState({hasViewed: false});
       this.callApi(owner, repo);
      event.preventDefault();

    }

    //When the user click on the row it should change the state of the object to
    markAsRead(repo){
        repo.hasViewed = true;
    }


    //Updates all the repos in the table
    updateRepos(){
      //Get the Current Repo and store then delete the existing one
      var currentRepos = store.get('repos');
      store.clearAll();
      //Clear temp list
      list.length = 0;
      //Call the api on each repo and add it back to the local storage
      currentRepos.map(item => {
        this.callApi(item.owner, item.repoName);
      })

    }


    //Gets the list of the repos from the local storage and prints them to the table
    getListofRepos(){
     var savedRepos = store.get('repos')
     if (savedRepos){
      return(
        <tbody>        
          {savedRepos.map(item => {
            if(item.hasViewed === false){
          return([
            //markedAsRead doesn't work but ideally you would have a variable on the object and then change the state of it when the user clicks on it
          <tr class="table-success" onClick={this.markAsRead(item)}>
            <td>{item.owner}</td>
            <td>{item.repoName}</td>
            <td>{<ReactTimeAgo date={item.reposDate} locale="en-US" timeStyle="round-minute"/>}</td>
            <td class="table-danger"> {item.message}</td>
          </tr>
          ])
            }else{
              return([
                <tr>
                  <td>{item.owner}</td>
                  <td>{item.repoName}</td>
                  <td>{<ReactTimeAgo date={item.reposDate} locale="en-US" timeStyle="round-minute"/>}</td>
                  <td> {item.message}</td>
                </tr>
                ])
            }
        })}
        </tbody>
      );
     }
    }

      render () {
        return (
          
        <div className="App">
        <button type="button" class="btn btn-primary ml-3" onClick={this.updateRepos.bind(this)}>Update Repos</button>
          <p className="text-secondary">Enter a Github Repo URL</p>
        <form onSubmit={this.handleSubmit}>
            <label>
                <input type="text" value={this.state.value} onChange={this.handleChange} className="form-control" />
            </label>

            <input type="submit" value="Submit" className="btn btn-warning ml-3" />
        </form>
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Owner</th>
                <th scope="col">Repo</th>
                <th scope="col">Last Release</th>
                <th scope="col">Commit Message</th>
              </tr>
            </thead>
                    {this.getListofRepos()}
          </table>

        </div>
        )
    }
  }

export default GetReleases;
