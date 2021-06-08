import { Component, OnInit} from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';



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
  gqlResPost: any;

  items: TreeviewItem[];
  config = TreeviewConfig.create({
    hasFilter: true,
    hasCollapseExpand: true,
    hasAllCheckBox: true,
    decoupleChildFromParent: true,
    maxHeight: 300,
  });

  private querySubscription: Subscription;

  constructor(private apollo: Apollo) {}

    ngOnInit() {
    this.querySubscription = this.apollo.watchQuery<Response>({
      query: LIST_ALL_DATA
    })
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.gqlResPost = data.feed;
      });

    
    this.items = [new TreeviewItem(
       {
      text: "IT",
      value: 9,
      children: [
        {
          text: "Programming",
          value: 91,
          children: [
            {
              text: "Frontend",
              value: 913,
              children: [
                { text: "Angular 1", value: 9111 },
                { text: "Angular 2", value: 9112 },
                { text: "ReactJS", value: 9113 },
              ],
            },
            {
              text: "Backend",
              value: 912,
              children: [
                { text: "C#", value: 9121 },
                { text: "Java", value: 9122 },
                { text: "Python", value: 9123, checked: false },
              ],
            },
          ],
        },
        {
          text: "Networking",
          value: 92,
          children: [
            { text: "Internet", value: 921 },
            { text: "Security", value: 922 },
          ],
        },
      ],
    }
    
    )];



 }  

    ngOnDestroy() {
      this.querySubscription.unsubscribe();
    }

}
