export interface Markup {
  name: string;
  description: string;
  id: string;
}

export interface ReferencePoint extends Markup {
  longitude: number;
  latitude: number;
  type: 'referencePoint';
}

export interface Folder extends Markup {
  type: 'folder';
}

export type MarkupNode = ReferencePoint | Folder;
