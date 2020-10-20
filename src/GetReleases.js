import { Octokit } from "@octokit/core";
import './App.css';
import React, { Component } from 'react'
import ReactTimeAgo from 'react-time-ago'

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
          hasViewed: ''
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

  }

    componentDidMount() {
      const list = store.get('repos');
    }


  callApi(owner, repo){
   octokit.request('GET /repos/{owner}/{repo}/commits/master', {
      owner: owner,
      repo: repo
    }).then(
      (response) => {        
        var date = response.data.commit.author.date.substring(0,response.data.commit.author.date.indexOf("-") +6);
        date = date.replace(/-/g, "/");
        this.setState({reposDate : date});
        list.push(this.state);
        store.clearAll();
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


    markAsRead(repo){
        repo.hasViewed = true;
        console.log("Clicked!");
    }

    getListofRepos(){
     var savedRepos = store.get('repos')
     if (savedRepos){
      return(
        <tbody>        
          {savedRepos.map(item => {
            if(item.hasViewed === false){
          return([
          <tr class="table-success" onClick={this.markAsRead(item)}>
            <td>{item.owner}</td>
            <td>{item.repoName}</td>
            <td>{<ReactTimeAgo date={item.reposDate} locale="en-US" timeStyle="round"/>}</td>
          </tr>
          ])
            }else{
              return([
                <tr>
                  <td>{item.owner}</td>
                  <td>{item.repoName}</td>
                  <td>{<ReactTimeAgo date={item.reposDate} locale="en-US" timeStyle="round"/>}</td>
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
              </tr>
            </thead>
                    {this.getListofRepos()}
          </table>
        </div>
        )
    }
  }

export default GetReleases;
