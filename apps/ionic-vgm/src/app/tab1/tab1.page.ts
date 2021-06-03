import { Component, OnInit} from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';

export const LIST_ALL_DATA = gql`
  query {
    feed {
      id
      title
      content
      published
      author {
        id
        name
        email
      }
    }
}`;


 // types for Response

type Post = {
   id: number;
   title: string;
   content: string;
   published: boolean;
   viewCount: number;
   author: User;
}

type User = {
  id: number;
  email: string;
  name: string;
  posts: Post[];
}

type Response = {
  feed: Post;
}

@Component({
  selector: 'vgm-converter-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})

export class Tab1Page implements OnInit {
  loading: boolean;
  gql_res_post: any;
  private querySubscription: Subscription;


  constructor(private apollo: Apollo) {}

    ngOnInit() {
    this.querySubscription = this.apollo.watchQuery<Response>({
      query: gql`
              query {
                feed {
                  id
                  title
                  content
                  published
                  author {
                    id
                    name
                    email
                  }
                }
            }`
    })
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.gql_res_post = data.feed;
      });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}
