import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as type from "./graphql.types";
import { Apollo, QueryRef } from 'apollo-angular';
import * as _ from 'lodash';
import { MeiliSearch } from 'meilisearch';
import { ConfigService } from './config.service';


@Injectable({
	providedIn: 'root',
})
export class DataService {
	public _dbInit: boolean = false;
	videoDBQuery: QueryRef<any>;
	videoDBSub: Subscription;
	audioDBQuery: QueryRef<any>;
	audioDBSub: Subscription;

	videoTreeQuery: QueryRef<any>;
	audioTreeQuery: QueryRef<any>;
	videoTreeSub: Subscription;
	audioTreeSub: Subscription;

	levelSub: Subscription;

	queryGQL: any[] = [
		type.LEVEL_1_QUERIES,
		type.LEVEL_2_QUERIES,
		type.LEVEL_3_QUERIES,
		type.LEVEL_4_QUERIES,
		type.LEVEL_5_QUERIES,
		type.LEVEL_6_QUERIES,
		type.LEVEL_7_QUERIES,
	];
	updateGQL: any[] = [
		type.UPDATE_LEVEL_2,
		type.UPDATE_LEVEL_3,
		type.UPDATE_LEVEL_4,
		type.UPDATE_LEVEL_5,
		type.UPDATE_LEVEL_6,
		type.UPDATE_LEVEL_7,
	]
	public videoDB: any[] = [];
	public videoDB$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	public videoTree: any = {};
	public videoTree$: BehaviorSubject<any> = new BehaviorSubject<any>({});

	public audioDB: any[] = [];
	public audioDB$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	public audioTree: any = {};
	public audioTree$: BehaviorSubject<any> = new BehaviorSubject<any>({});

	public meiliSearch;

	constructor(
		private apollo: Apollo,
		private _configService: ConfigService
	) {
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
		try {
			await this.fetchTree();
			if (this._configService.searchGateway.status) {
				this.meiliSearch = new MeiliSearch({
					host: this._configService.searchGateway.gateway, // 'http://search.hjm.bid'
					apiKey: this._configService.searchGateway.key, // 'KYV2oMHSE5G2p9ZXwUGH3CfWpaXB1CF5'
				})
			}
		} catch (error) {
			console.log(error);
		}
		return new Promise((resolve) => {
			if (this.videoDB && this.videoTree && this.audioDB && this.audioTree) {
				this._dbInit = true;
				resolve(null);
			}
		});
	}

	async fetchTree() {
		this.videoTreeQuery = this.apollo.watchQuery<any>({
			query: type.LEVEL_1_TREE,
			variables: {
				id: '00000000-0000-0000-0000-000000000001'
			},
			fetchPolicy: 'cache-and-network'
		})
		this.videoTreeSub = this.videoTreeQuery.valueChanges.subscribe(({ data }) => {
			this.videoTree$.next(_.cloneDeep(data[Object.keys(data)[0]]));
		});


		this.audioTreeQuery = this.apollo.watchQuery<any>({
			query: type.LEVEL_1_TREE,
			variables: {
				id: '00000000-0000-0000-0000-000000000002'
			},
			fetchPolicy: 'cache-and-network'
		})
		this.audioTreeSub = this.audioTreeQuery.valueChanges.subscribe(({ data }) => {
			this.audioTree$.next(_.cloneDeep(data[Object.keys(data)[0]]));
		});
	}


	async treeRefresh(isVideo: boolean) {
		if (isVideo) {
			await this.videoTreeQuery.refetch();
		} else {
			await this.audioTreeQuery.refetch();
		}
	}


	async fetchLevelDB(level: number, isVideo?, isLeaf?, id?: string, url?: string): Promise<any> {
		return new Promise((resolve) => {
			this.levelSub = this.apollo.watchQuery<any>({
				query: this.queryGQL[level - 1],
				variables: {
					isVideo: isVideo,
					isLeaf: isLeaf,
					id: id,
					url: url,
				},
				fetchPolicy: 'cache-and-network',
			}).valueChanges.subscribe(({ data }) => {
				const list = data[Object.keys(data)[0]];
				// console.log('fetched Level DB:', level, list, data);
				if (list) resolve(list);
			});

		});
	}

	async updateSingle(dblevel, options) {
		return new Promise((resolve) => {
			this.apollo.mutate<any>({
				mutation: this.updateGQL[dblevel - 2],
				variables: options,
				fetchPolicy: 'network-only',
			}).subscribe(({ data }) => {
				console.log(data);
				resolve('done');
			}, (error) => {
				console.log('error updating single item', error);
			});
		})
	}


	ngOnDestroy() {
		(this.videoDBSub, this.audioDBSub, this.videoTreeSub, this.audioTreeSub, this.levelSub as Subscription).unsubscribe();
	}
}
