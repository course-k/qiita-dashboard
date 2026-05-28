import axios, { AxiosInstance } from 'axios'

export interface QiitaUser {
  id: string
  name: string
  description: string
  profile_image_url: string
  items_count: number
  followers_count: number
  followees_count: number
}

export interface QiitaItem {
  id: string
  title: string
  url: string
  tags: Array<{ name: string }>
  created_at: string
  updated_at: string
  likes_count: number
  stocks_count: number
  page_views_count: number | null
  comments_count: number
}

export interface QiitaLike {
  created_at: string
  user: { id: string }
}

const client: AxiosInstance = axios.create({
  baseURL: 'https://qiita.com/api/v2',
  headers: {
    Authorization: `Bearer ${process.env.QIITA_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

async function fetchAllPages<T>(url: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const results: T[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const res = await client.get<T[]>(url, { params: { ...params, page, per_page: perPage } })
    results.push(...res.data)
    if (res.data.length < perPage) break
    page++
  }

  return results
}

export async function fetchAuthenticatedUser(): Promise<QiitaUser> {
  const res = await client.get<QiitaUser>('/authenticated_user')
  return res.data
}

export async function fetchAllItems(): Promise<QiitaItem[]> {
  return fetchAllPages<QiitaItem>('/authenticated_user/items')
}

export async function fetchLikes(itemId: string): Promise<QiitaLike[]> {
  return fetchAllPages<QiitaLike>(`/items/${itemId}/likes`)
}

