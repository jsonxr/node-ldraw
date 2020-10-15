
export interface LDrawMetaData {
  name: string
  file: string
  description: string
  author: string
  type: string
  license: string
  help: string[]
  keywords: string[]
  category: string
  history: string[]
  update: string
}

export interface LDrawPart extends LDrawMetaData {
  geometry: Float32Array
}

export interface LDrawModel extends LDrawMetaData {
  theme: string
  parts: LDrawPart[]
}

export interface LDrawSet {
  name: string
  setNumber?: string
  subModelName?: string
  year?: string

  models: LDrawModel[]
  parts: LDrawPart[] // Custom parts that are defined in the set only
}
