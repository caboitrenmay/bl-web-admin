import request from '@/utils/request'

export function fetchClanTeamList(query) {
  return request({
    url: '/clan/all',
    method: 'get',
    params: query
  })
}

export function getClanTeamList(query) {
  return request({
    url: '/clan/get',
    method: 'get',
    params: query
  })
}

export function createClanTeam(data) {
  return request({
    url: '/clan',
    method: 'post',
    data
  })
}

export function updateClanTeam(data) {
  return request({
    url: '/clan',
    method: 'put',
    data
  })
}

export function deleteClanTeam(id) {
  return request({
    url: `/clan?id=${id}`,
    method: 'delete'
  })
}
