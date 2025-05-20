export type Folder = {
  id: string;
  name: string;
  parentId?: string;
  type: string;
  description: string;
};

export type ReferencePoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  parentId?: string;
  type: string;
  description: string;
};

export type Child = Folder | ReferencePoint;
