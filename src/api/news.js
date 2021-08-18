import request from '@/utils/request'

export function fetchNewsList(query) {
  return request({
    url: '/news/all',
    method: 'get',
    params: query
  })
}

export function createNews(data) {
  return request({
    url: '/news',
    method: 'post',
    data
  })
}

export function updateNews(data) {
  return request({
    url: '/news',
    method: 'put',
    data
  })
}

export function deleteNews(id) {
  return request({
    url: `/news?id=${id}`,
    method: 'delete'
  })
}
