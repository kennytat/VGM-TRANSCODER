import { gql } from 'apollo-angular';
// types for Response
export type Media = {
  id: string;
  pid: string;
  name: string;
  qm: string;
  categories: Category[];
}

export type Category = {
  id: string;
  pid: string;
  media: Media[];
  name: string;
  qm: string;
  classes: Classification[];
}

export type Classification = {
  id: string;
  pid: string;
  categories: Category[];
  name: string;
  qm: string;
  topics: Topic[];
}

export type Topic = {
  id: string;
  pid: string;
  classes: Classification[];
  name: string;
  qm: string;
  contents: Content[];
}

export type Content = {
  id: string;
  pid: string;
  topics: Topic[];
  name: string;
  createdAt: number;
  updatedAt: number;
  qm: string;
  duration: string;
  size: string;
  origin: string;
  folder: string;
  verse: string;
  thumb: string;
  filetype: string;
}


export const LIST_ALL_QUERY = gql`
 query {
  media (id: "41dcec53-b35f-4c9d-8c2e-403a4ba894d7") {
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

export const VIDEO_CLASS_QUERY = gql`
  query {
  getVideoClasses {
    id
    dblevel
    pid
    name
    qm
  }
}`;

export const VIDEO_TOPIC_QUERY = gql`
   query {
  getVideoTopics {
    id
    pid
    name
    classes {
      id
      name
    }
  }
}`;

export const VIDEO_QUERY = gql`
  query {
  video {
    id
    pid
    name
    qm
    updatedAt
    createdAt
    origin
    folder
    verse
    thumb
    size
    duration
    filetype
    topic {
      name
      classes {
        name
      }
    }
  }
}`;

export const AUDIO_QUERY = gql`
  query {
  audio {
    id
    pid
    name
    qm
    updatedAt
    createdAt
    origin
    folder
    verse
    thumb
    size
    duration
    filetype
    topic {
      name
      classes {
        name
      }
    }
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
mutation {
  deleteContent (id: $contentId) {
    id
    name
  }
}`;