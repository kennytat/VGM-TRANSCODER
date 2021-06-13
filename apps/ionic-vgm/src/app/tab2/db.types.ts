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
  name: string;
  qm: string;
  classes: Classification[];
}

export type Classification = {
  id: string;
  pid: string;
  name: string;
  qm: string;
  topics: Topic[];
}

export type Topic = {
  id: string;
  pid: string;
  name: string;
  qm: string;
  contents: Content[]; 
}

export type Content = {
  id: string;
  pid: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  qm: string;
  duration: number;
  size: number;
  thumb: string;
  filetype: string;
}


export const LIST_ALL_QUERY = gql`
 query {
  media (id: "effbc45f-bed4-4d8a-ac91-c4430139ade2") {
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

export const VIDEO_QUERY = gql`
  query {
  video {
    id
    pid
    name
    qm
    updatedAt
    createdAt
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
