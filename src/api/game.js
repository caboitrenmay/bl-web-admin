import request from '@/utils/request'

export function fetchGameList(query) {
  return request({
    url: '/game/all',
    method: 'get',
    params: query
  })
}

export function createGame(data) {
  return request({
    url: '/game',
    method: 'post',
    data
  })
}

export function updateGame(data) {
  return request({
    url: '/game',
    method: 'put',
    data
  })
}

export function deleteGame(id) {
  return request({
    url: `/game?id=${id}`,
    method: 'delete'
  })
}

export function getAllByTime(data, query) {
  return request({
    url: '/game/time',
    method: 'post',
    data,
    params: query
  })
}
