import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import { Media, Category, Classification, Topic, Content } from './db.types'

export const LIST_ALL_DATA = gql`
 query {
  media (id: "856ca230-205f-40e0-9aaf-e776843a548f") {
    value:id
    text:name
    children:categories {
          value:id
          text:name
          children:classes {
            value:id
            text:name
            children:topics {
              value:id
              text:name
              children:contents {
                value:id
                text:name
            }
          }
        }
      }
  }
}`;

type Response = {
  media: Media;
  categories: Category;
  adad: Category;
  classes: Classification;
  topics: Topic;
  contents: Content;
}

@Component({
  selector: 'vgm-converter-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})

export class Tab1Page implements OnInit {
  constructor(private apollo: Apollo) { }

  // GQL client subscription for connecting GQL server
  private querySubscription: Subscription;
  // Declare variable and setting for mapping GQL data to ngx-Tree
  loading: boolean;
  allDB;
  videoDB;
  videoTree: TreeviewItem[];
  audioDB;
  audioTree: TreeviewItem[];
  treeHeight = window.innerHeight - 400;
  config = TreeviewConfig.create({
    hasFilter: true,
    hasCollapseExpand: true,
    hasAllCheckBox: true,
    decoupleChildFromParent: false,
    maxHeight: this.treeHeight
  });
  // Declare variable for videoDB and audioDB seperately
  videoBtnColor = 'primary';
  audioBtnColor = 'light';
  video = true;
  showDiv(divVal: string) {
    if (divVal === 'V') {
      this.video = true;
      this.videoBtnColor = 'primary';
      this.audioBtnColor = 'light';
    } else {
      this.video = false;
      this.videoBtnColor = 'light';
      this.audioBtnColor = 'primary';
    }
  }
  // Run function OnInit
  ngOnInit() {
    this.querySubscription = this.apollo.watchQuery<Response>({
      query: LIST_ALL_DATA
    })
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.allDB = data.media;
        if (this.allDB.children[1].text === 'videoDB') {
          this.videoDB = this.allDB.children[1];
          this.audioDB = this.allDB.children[0];
        } else {
          this.videoDB = this.allDB.children[0];
          this.audioDB = this.allDB.children[1];
        }
        this.videoTree = [new TreeviewItem(this.videoDB)];
        this.audioTree = [new TreeviewItem(this.audioDB)];
      });

  }

  treeSelectedChange(event) {
    console.log(event);
  }

  treeFilterChange(event: string) {
    console.log('filter:', event);
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}