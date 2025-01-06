type BlogItem = {
  name: string
  link: string
}

type Owner = {
  name: string
  link: string
  avatar: string
}

type DataItem = {
  blog: BlogItem
  owner: Owner
}

type Metadata = {
  total: number
  updatedAt: string
  source: string
}

export type AwesomeSdeBlogs = {
  data: DataItem[]
  metadata: Metadata
};