import { Octokit } from "@octokit/core";
import './App.css';
import React, { Component } from 'react'
import ReactTimeAgo from 'react-time-ago'

const octokit = new Octokit();
const list = [];

class GetReleases extends Component {

  constructor(props) {
      super(props);
      this.state = {
          value: '',
          result: '',
          reposDate: '',
          owner: '',
          repoName: ''
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

  }

    componentDidMount() {
      localStorage.setItem('listOfRepos', list)

    }


  callApi(owner, repo){
   octokit.request('GET /repos/{owner}/{repo}', {
      owner: owner,
      repo: repo
    }).then(
      (response) => {
        var date = response.data.updated_at.substring(0,response.data.updated_at.indexOf("-") +6);
        date =  date.replace(/-/g, "/");
        this.setState({reposDate : date});
        list.push(this.state);
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
       this.callApi(owner, repo);
      event.preventDefault();

    }

    getListofRepos(){
      return(
        <tbody>        
          {list.map(item => {
          return([
          <tr>
            <td>{item.owner}</td>
            <td>{item.repoName}</td>
            <td>{<ReactTimeAgo date={item.reposDate} locale="en-US" timeStyle="round"/>}</td>
          </tr>
          ])})}
        </tbody>
      );
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
