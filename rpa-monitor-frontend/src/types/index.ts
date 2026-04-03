export interface RpaError {
  id: number;
  messageId: number;
  projectNumber: string;
  stage: string;
  exType: string;
  exMessage: string;
  activityType: string;
  activityName: string;
  computerName: string;
  componentId: string;
  screenResolution: string;
  triesCount: string;
  createdAt: string;
  isRead: boolean;
}

export interface JenkinsError {
  id: number;
  messageId: number;
  projectNumber: string;
  stage: string;
  exType: string;
  exMessage: string;
  activityBlock: string;
  jenkinsNode: string;
  screenResolution: string;
  createdAt: string;
  isRead: boolean;
}

export interface LastErrorDto {
  projectNumber: string;
  message: string;
  isRead: boolean;
  messageId: number;
  source: string;
  createdAt: string;
  stage: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type UserDto = {
  id: number;
  username: string;
  role: string;
};