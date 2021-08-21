import { gql } from 'apollo-angular';
// types for Response
export type Root = {
  id: string,
  dblevel: number,
  name: string,
  children: Level1[],
}


export type Level1 = {
  id: string;
  pid: string;
  dblevel: number,
  location: string,
  isLeaf: boolean,
  isVideo: boolean,
  name: string,
  count: number,
  parent: Root[];
  children: Level2[];
}

export type Level2 = {
  id: string;
  pid: string;
  dblevel: number,
  location: string,
  url: string,
  name: string,
  count: number,
  isLeaf: boolean,
  isVideo: boolean,
  keyword: string,
  thumb: string,
  qm: string,
  hash: string,
  audience: number,
  mtime: number,
  viewCount: number,
  duration: string,
  size: number,
  parent: Level1[];
  children: Level3[];
}


export type Level3 = {
  id: string;
  pid: string;
  dblevel: number,
  location: string,
  url: string,
  name: string,
  count: number,
  isLeaf: boolean,
  isVideo: boolean,
  keyword: string,
  thumb: string,
  qm: string,
  hash: string,
  audience: number,
  mtime: number,
  viewCount: number,
  duration: string,
  size: number,
  parent: Level2[];
  children: Level4[];
}

export type Level4 = {
  id: string;
  pid: string;
  dblevel: number,
  location: string,
  url: string,
  name: string,
  count: number,
  isLeaf: boolean,
  isVideo: boolean,
  keyword: string,
  thumb: string,
  qm: string,
  hash: string,
  audience: number,
  mtime: number,
  viewCount: number,
  duration: string,
  size: number,
  parent: Level3[];
  children: Level5[];
}

export type Level5 = {
  id: string;
  pid: string;
  dblevel: number,
  location: string,
  url: string,
  name: string,
  count: number,
  isLeaf: boolean,
  isVideo: boolean,
  keyword: string,
  thumb: string,
  qm: string,
  hash: string,
  audience: number,
  mtime: number,
  viewCount: number,
  duration: string,
  size: number,
  parent: Level4[];
  children: Level6[];
}

export type Level6 = {
  id: string;
  pid: string;
  dblevel: number,
  location: string,
  url: string,
  name: string,
  count: number,
  isLeaf: boolean,
  isVideo: boolean,
  keyword: string,
  thumb: string,
  qm: string,
  hash: string,
  audience: number,
  mtime: number,
  viewCount: number,
  duration: string,
  size: number,
  parent: Level5[];
  children: Level7[];
}

export type Level7 = {
  id: string;
  pid: string;
  dblevel: number,
  location: string,
  url: string,
  name: string,
  count: number,
  isLeaf: boolean,
  isVideo: boolean,
  keyword: string,
  thumb: string,
  qm: string,
  hash: string,
  audience: number,
  mtime: number,
  viewCount: number,
  duration: string,
  size: number,
  parent: Level6[];
}


export const ALL_DATA = gql`
 query level1Unique($id: String!){
  level1Unique(id: $id) {
    id
    isLeaf
    name
    location
    dblevel
     children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
           children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
           children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
           children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
           children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
           children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
        }
        }
        }
        }
        }
        }
  }
}`;

export const LEVEL_1_TREE = gql`
 query level1Unique($id: String!){
  level1Unique(id: $id) {
    value:id
    text:name
    children {
          value:id
          text:name
          children {
            value:id
            text:name
            children {
              value:id
              text:name
              children {
                value:id
                text:name
                children {
                  value:id
                  text:name
                  children {
                    value:id
                    text:name
                }
              }
            }
          }
        }
      }
  }
}`;

export const LEVEL_2_QUERIES = gql`
  query level2Queries(
      $isVideo:Boolean!,
      $isLeaf:Boolean,
      $id:String){
    level2Queries(
      isVideo:$isVideo,
      isLeaf:$isLeaf,
      id:$id)
      {
        id
        pid
        dblevel
        location
        isVideo
        url
        name
        count
        isLeaf
        keyword
        hash
        viewCount
        duration
        size
        children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
        }
      }
}`;

export const LEVEL_3_QUERIES = gql`
  query level3Queries(
      $isVideo:Boolean!,
      $isLeaf:Boolean,
      $id:String){
    level3Queries(
      isVideo:$isVideo,
      isLeaf:$isLeaf,
      id:$id)
      {
        id
        pid
        dblevel
        location
        isVideo
        url
        name
        count
        isLeaf
        keyword
        hash
        viewCount
        duration
        size
        children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
        }
      }
}`;

export const LEVEL_4_QUERIES = gql`
  query level4Queries(
      $isVideo:Boolean!,
      $isLeaf:Boolean,
      $id:String){
    level4Queries(
      isVideo:$isVideo,
      isLeaf:$isLeaf,
      id:$id)
      {
        id
        pid
        dblevel
        location
        isVideo
        url
        name
        count
        isLeaf
        keyword
        hash
        viewCount
        duration
        size
        children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
        }
      }
}`;

export const LEVEL_5_QUERIES = gql`
  query level5Queries(
      $isVideo:Boolean!,
      $isLeaf:Boolean,
      $id:String){
    level5Queries(
      isVideo:$isVideo,
      isLeaf:$isLeaf,
      id:$id)
      {
        id
        pid
        dblevel
        location
        isVideo
        url
        name
        count
        isLeaf
        keyword
        hash
        viewCount
        duration
        size
        children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
        }
      }
}`;

export const LEVEL_6_QUERIES = gql`
  query level6Queries(
      $isVideo:Boolean!,
      $isLeaf:Boolean,
      $id:String){
    level6Queries(
      isVideo:$isVideo,
      isLeaf:$isLeaf,
      id:$id)
      {
        id
        pid
        dblevel
        location
        isVideo
        url
        name
        count
        isLeaf
        keyword
        hash
        viewCount
        duration
        size
        children {
          id
          pid
          dblevel
          location
          isVideo
          url
          name
          count
          isLeaf
          keyword
          hash
          viewCount
          duration
          size
        }
      }
}`;

export const LEVEL_7_QUERIES = gql`
  query level7Queries(
      $isVideo:Boolean!,
      $isLeaf:Boolean,
      $id:String){
    level7Queries(
      isVideo:$isVideo,
      isLeaf:$isLeaf,
      id:$id)
      {
        id
        pid
        dblevel
        location
        isVideo
        url
        name
        count
        isLeaf
        keyword
        hash
        viewCount
        duration
        size
      }
}`;

export const CREATE_LEVEL_2 = gql`
mutation createLevel2 (
  $pid: String!,
  $isLeaf: Boolean,
  $location: String!,
  $url: String!,
  $isVideo: Boolean!,
  $name: String!,
  $count: Int ,
  $keyword: String,
  $thumb: String,
  $qm: String,
  $hash: String,
  $audience: Int,
  $mtime: Int,
  $viewCount: Int,
  $duration: String,
  $size: Int,
  ) {
  createLevel2 (
    data:{
      pid: $pid
      isLeaf: $isLeaf,
      location: $location,
      url: $url,
      isVideo: $isVideo,
      name: $name,
      count: $count,
      keyword: $keyword,
      thumb: $thumb,
      qm: $qm,
      hash: $hash,
      audience: $audience,
      mtime: $mtime,
      viewCount: $viewCount,
      duration: $duration,
      size: $size,
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    hash
    duration
    size
  }
}`;

export const CREATE_LEVEL_3 = gql`
mutation createLevel3 (
  $pid: String!,
  $isLeaf: Boolean,
  $location: String!,
  $url: String!,
  $isVideo: Boolean!,
  $name: String!,
  $count: Int ,
  $keyword: String,
  $thumb: String,
  $qm: String,
  $hash: String,
  $audience: Int,
  $mtime: Int,
  $viewCount: Int,
  $duration: String,
  $size: Int,
  ) {
  createLevel3 (
    data:{
      pid: $pid
      isLeaf: $isLeaf,
      location: $location,
      url: $url,
      isVideo: $isVideo,
      name: $name,
      count: $count,
      keyword: $keyword,
      thumb: $thumb,
      qm: $qm,
      hash: $hash,
      audience: $audience,
      mtime: $mtime,
      viewCount: $viewCount,
      duration: $duration,
      size: $size,
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    hash
    duration
    size
  }
}`;

export const CREATE_LEVEL_4 = gql`
mutation createLevel4 (
  $pid: String!,
  $isLeaf: Boolean,
  $location: String!,
  $url: String!,
  $isVideo: Boolean!,
  $name: String!,
  $count: Int ,
  $keyword: String,
  $thumb: String,
  $qm: String,
  $hash: String,
  $audience: Int,
  $mtime: Int,
  $viewCount: Int,
  $duration: String,
  $size: Int,
  ) {
  createLevel4 (
    data:{
      pid: $pid
      isLeaf: $isLeaf,
      location: $location,
      url: $url,
      isVideo: $isVideo,
      name: $name,
      count: $count,
      keyword: $keyword,
      thumb: $thumb,
      qm: $qm,
      hash: $hash,
      audience: $audience,
      mtime: $mtime,
      viewCount: $viewCount,
      duration: $duration,
      size: $size,
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    hash
    duration
    size
  }
}`;

export const CREATE_LEVEL_5 = gql`
mutation createLevel5 (
  $pid: String!,
  $isLeaf: Boolean,
  $location: String!,
  $url: String!,
  $isVideo: Boolean!,
  $name: String!,
  $count: Int ,
  $keyword: String,
  $thumb: String,
  $qm: String,
  $hash: String,
  $audience: Int,
  $mtime: Int,
  $viewCount: Int,
  $duration: String,
  $size: Int,
  ) {
  createLevel5 (
    data:{
      pid: $pid
      isLeaf: $isLeaf,
      location: $location,
      url: $url,
      isVideo: $isVideo,
      name: $name,
      count: $count,
      keyword: $keyword,
      thumb: $thumb,
      qm: $qm,
      hash: $hash,
      audience: $audience,
      mtime: $mtime,
      viewCount: $viewCount,
      duration: $duration,
      size: $size,
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    hash
    duration
    size
  }
}`;

export const CREATE_LEVEL_6 = gql`
mutation createLevel6 (
  $pid: String!,
  $isLeaf: Boolean,
  $location: String!,
  $url: String!,
  $isVideo: Boolean!,
  $name: String!,
  $count: Int ,
  $keyword: String,
  $thumb: String,
  $qm: String,
  $hash: String,
  $audience: Int,
  $mtime: Int,
  $viewCount: Int,
  $duration: String,
  $size: Int,
  ) {
  createLevel6 (
    data:{
      pid: $pid
      isLeaf: $isLeaf,
      location: $location,
      url: $url,
      isVideo: $isVideo,
      name: $name,
      count: $count,
      keyword: $keyword,
      thumb: $thumb,
      qm: $qm,
      hash: $hash,
      audience: $audience,
      mtime: $mtime,
      viewCount: $viewCount,
      duration: $duration,
      size: $size,
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    hash
    duration
    size
  }
}`;

export const CREATE_LEVEL_7 = gql`
mutation createLevel7 (
  $pid: String!,
  $isLeaf: Boolean,
  $location: String!,
  $url: String!,
  $isVideo: Boolean!,
  $name: String!,
  $count: Int ,
  $keyword: String,
  $thumb: String,
  $qm: String,
  $hash: String,
  $audience: Int,
  $mtime: Int,
  $viewCount: Int,
  $duration: String,
  $size: Int,
  ) {
  createLevel7 (
    data:{
      pid: $pid
      isLeaf: $isLeaf,
      location: $location,
      url: $url,
      isVideo: $isVideo,
      name: $name,
      count: $count,
      keyword: $keyword,
      thumb: $thumb,
      qm: $qm,
      hash: $hash,
      audience: $audience,
      mtime: $mtime,
      viewCount: $viewCount,
      duration: $duration,
      size: $size,
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    hash
    duration
    size
  }
}`;

export const UPDATE_LEVEL_2 = gql`
mutation updateLevel2 (
  $id: String!,
  $isLeaf: Boolean,
  $count: Int
  ) {
  updateLevel2 (
    data:{
      id: $id,
      isLeaf: $isLeaf,
      count: $count
  }) {
    id
    pid
    isLeaf
    name
    url
    isVideo
    dblevel
    location
    count
  }
}`;

export const UPDATE_LEVEL_3 = gql`
mutation updateLevel3 (
  $id: String!,
  $isLeaf: Boolean,
  $count: Int
  ) {
  updateLevel3 (
    data:{
      id: $id
      isLeaf: $isLeaf,
      count: $count
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    count
  }
}`;

export const UPDATE_LEVEL_4 = gql`
mutation updateLevel4 (
  $id: String!,
  $isLeaf: Boolean,
  $count: Int
  ) {
  updateLevel4 (
    data:{
      id: $id
      isLeaf: $isLeaf,
      count: $count
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    count
  }
}`;

export const UPDATE_LEVEL_5 = gql`
mutation updateLevel5 (
  $id: String!,
  $isLeaf: Boolean,
  $count: Int
  ) {
  updateLevel5 (
    data:{
      id: $id
      isLeaf: $isLeaf,
      count: $count
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    count
  }
}`;

export const UPDATE_LEVEL_6 = gql`
mutation updateLevel6 (
  $id: String!,
  $isLeaf: Boolean,
  $count: Int
  ) {
  updateLevel6 (
    data:{
      id: $id,
      isLeaf: $isLeaf,
      count: $count
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    count
  }
}`;

export const UPDATE_LEVEL_7 = gql`
mutation updateLevel7 (
  $id: String!,
  $isLeaf: Boolean,
  ) {
  updateLevel7 (
    data:{
      id: $id
      isLeaf: $isLeaf
  }) {
    id
    pid
    isLeaf
    url
    name
    isVideo
    dblevel
    location
    count
  }
}`;

export const DELETE_LEVEL_2 = gql`
mutation deleteLevel2 ($id: String!) {
  deleteLevel2 (id: $id) {
    id
    name
  }
}`;

export const DELETE_LEVEL_3 = gql`
mutation deleteLevel3 ($id: String!) {
  deleteLevel3 (id: $id) {
    id
    name
  }
}`;
export const DELETE_LEVEL_4 = gql`
mutation deleteLevel4 ($id: String!) {
  deleteLevel4 (id: $id) {
    id
    name
  }
}`;
export const DELETE_LEVEL_5 = gql`
mutation deleteLevel5 ($id: String!) {
  deleteLevel5 (id: $id) {
    id
    name
  }
}`;
export const DELETE_LEVEL_6 = gql`
mutation deleteLevel6 ($id: String!) {
  deleteLevel6 (id: $id) {
    id
    name
  }
}`;
export const DELETE_LEVEL_7 = gql`
mutation deleteLevel7 ($id: String!) {
  deleteLevel7 (id: $id) {
    id
    name
  }
}`;
