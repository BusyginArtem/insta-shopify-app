import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { InstagramAccountType, InstagramPostType } from 'src/context/types'

export interface IFacebookService {
  getInstagramAccounts: () => Promise<InstagramAccountType[]>
  getInstagramPosts: (instagramId: string) => Promise<InstagramPostType[]>
  accessToken: string
  httpClient: AxiosInstance
}

class FacebookService implements IFacebookService {
  public accessToken: string
  public httpClient: AxiosInstance

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.httpClient = axios.create({
      baseURL: 'https://graph.facebook.com/v18.0'
    })
  }

  async getInstagramAccounts(): Promise<InstagramAccountType[]> {
    const igAccounts: InstagramAccountType[] = []
    const fbPages: AxiosResponse = await this.httpClient.get(`/me/accounts?access_token=${this.accessToken}`)

    for (const fbPage of fbPages.data.data) {
      const connectedIgAccount: AxiosResponse = await this.httpClient.get(
        `/${fbPage.id}?fields=connected_instagram_account&origin_graph_explorer=1&transport=cors&access_token=${this.accessToken}`
      )

      // console.log('connectedIgAccount >>>>>>>>>>>', connectedIgAccount)

      const igAccount: AxiosResponse = await this.httpClient.get(
        `/${connectedIgAccount.data.connected_instagram_account.id}?fields=name,ig_id,username,profile_picture_url&access_token=${this.accessToken}`
      )

      // console.log('igAccount >>>>>>>>>>>', igAccount)

      igAccounts.push(igAccount.data)
    }

    return igAccounts
  }

  async getInstagramPosts(instagramId: string): Promise<InstagramPostType[]> {
    const media = await this.httpClient.get(
      `/${instagramId}/media?fields=id,media_type,media_url,permalink,thumbnail_url,media_product_type,timestamp,caption&access_token=${this.accessToken}`
    )

    return media.data.data || []
  }
}

export default FacebookService
