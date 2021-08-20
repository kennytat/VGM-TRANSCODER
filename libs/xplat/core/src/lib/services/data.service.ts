import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as type from "./graphql.types";
import { Apollo } from 'apollo-angular';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public _dbInit: boolean = false;
  dbSub: Subscription
  treeSub: Subscription
  public videoDB: any[] = [];
  public videoDB$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  public videoTree: any = {};
  public videoTree$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  public audioDB: any[] = [];
  public audioDB$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  public audioTree: any = {};
  public audioTree$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(private apollo: Apollo) {
    this.videoDB$.subscribe((newList: any[]) => {
      this.videoDB = newList;
    });
    this.videoTree$.subscribe((newTree: any) => {
      this.videoTree = newTree;
    });
    this.audioDB$.subscribe((newlist: any[]) => {
      this.audioDB = newlist;
    });
    this.audioTree$.subscribe((newTree: any) => {
      this.audioTree = newTree;
    });
  }



  async dbInit() {
    await this.fetchDB(true)
    await this.fetchDB(false)
    return new Promise((resolve) => {
      if (this.videoDB && this.videoTree && this.audioDB && this.audioTree) {
        this._dbInit = true
        resolve(null);
      }
    });
  }

  async fetchDB(isVideo) {
    let id: string;
    if (isVideo) {
      id = '00000000-0000-0000-0000-000000000001';
    } else {
      id = '00000000-0000-0000-0000-000000000002';
    }
    this.dbSub = await this.apollo.watchQuery<any>({
      query: type.ALL_DATA,
      variables: {
        id: id
      },
      fetchPolicy: 'network-only',
    }).valueChanges.subscribe(({ data }) => {
      if (isVideo) {
        this.videoDB$.next([_.cloneDeep(data.level1Unique)]);
      } else {
        this.audioDB$.next([_.cloneDeep(data.level1Unique)]);
      }
      this.fetchTree(id, isVideo)
    })

  }


  async fetchTree(id, isVideo) {
    this.treeSub = await this.apollo.watchQuery<any>({
      query: type.LEVEL_1_TREE,
      variables: {
        id: id
      },
      fetchPolicy: 'network-only'
    }).valueChanges.subscribe(({ data }) => {
      if (isVideo) {
        this.videoTree$.next(_.cloneDeep(data.level1Unique));
      } else {
        this.audioTree$.next(_.cloneDeep(data.level1Unique));
      }
    });
  }

}
