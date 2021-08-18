import request from '@/utils/request'

export function fetchRssList(query) {
  return request({
    url: '/news/rss',
    method: 'get',
    params: query
  })
}

export function createRss(data) {
  return request({
    url: '/news/rss',
    method: 'post',
    data
  })
}

export function updateRss(id, data) {
  return request({
    url: `/news/${id}`,
    method: 'patch',
    data
  })
}

export function deleteRss(id) {
  return request({
    url: `/news/${id}`,
    method: 'delete'
  })
}
