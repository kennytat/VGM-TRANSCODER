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

export const CREATE_CONTENT = gql`
mutation createContent (
  $contentName: String!,
  $contentPid: String!,
  $contentDuration: String!,
    $contentSize: String!,
     $contentOrigin: String!,
 $contentFolder: String!,
  $contentThumb: String!,
    $contentType: String!
  ) {
  createContent (data:{
    name: $contentName,
    pid: $contentPid,
    duration: $contentDuration,
    size: $contentSize,
    origin: $contentOrigin,
    folder: $contentFolder,
    thumb: $contentThumb,
    filetype: $contentType
  }) {
     id
  dblevel
  pid
  name
  createdAt
  updatedAt
  qm
  duration
  size
  origin
  folder
  verse
  thumb
  filetype
  }
}`;


export const DELETE_CONTENT = gql`
mutation  deleteContent ($contentId: String!) {
  deleteContent (id: $contentId) {
    id
    name
  }
}`;