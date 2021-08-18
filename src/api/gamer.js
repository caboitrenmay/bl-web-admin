import request from '@/utils/request'

export function fetchGamerList(query) {
  return request({
    url: '/gamer/all',
    method: 'get',
    params: query
  })
}

export function createGamer(data) {
  return request({
    url: '/gamer',
    method: 'post',
    data
  })
}

export function updateGamer(data) {
  return request({
    url: '/gamer',
    method: 'put',
    data
  })
}

export function deleteGamer(id) {
  return request({
    url: `/gamer?id=${id}`,
    method: 'delete'
  })
}
