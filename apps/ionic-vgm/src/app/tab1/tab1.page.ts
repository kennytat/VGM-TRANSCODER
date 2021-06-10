import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';



export const LIST_ALL_DATA = gql`
  query {
  media (id: "6c8c1189-8cf7-4bd8-9c1d-cd072a6a12df") {
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


// types for Response
type Media = {
  id: string;
  pid: string;
  name: string;
  qm: string;
  categories: Category[];
}

type Category = {
  id: string;
  pid: string;
  name: string;
  qm: string;
  classes: Classification[];
}

type Classification = {
  id: string;
  pid: string;
  name: string;
  qm: string;
  topics: Topic[];
}

type Topic = {
  id: string;
  pid: string;
  name: string;
  qm: string;
  contents: Content[]; 
}

type Content = {
  id: string;
  pid: string;
  name: string;
  qm: string;
  duration: number;
  size: number;
  thumb: string;
  isvideo: boolean;
}
type Response = {
  media: Media;
}

@Component({
  selector: 'vgm-converter-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})

export class Tab1Page implements OnInit {
  constructor(private apollo: Apollo) { }

  private querySubscription: Subscription;
  h = window.innerHeight-200;
  loading: boolean;
  itemList;
  items: TreeviewItem[];
  config = TreeviewConfig.create({
    hasFilter: true,
    hasCollapseExpand: true,
    hasAllCheckBox: true,
    decoupleChildFromParent: false,
    maxHeight: this.h
  });
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

  ngOnInit() {
    this.querySubscription = this.apollo.watchQuery<Response>({
      query: LIST_ALL_DATA
    })
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.itemList = data.media;
        this.items = [new TreeviewItem(this.itemList)];
       // this.items.getCorrectChecked()
      });

  }

  treeVSelectedChange(event) {
    console.log(event);
  }

  treeVFilterChange(event:string){
    console.log('filter:', event);
  }
  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}