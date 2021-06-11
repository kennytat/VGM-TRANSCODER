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