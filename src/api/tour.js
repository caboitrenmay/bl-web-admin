import request from '@/utils/request'

export function fetchTournamentList() {
  return request({
    url: '/tournament/all',
    method: 'get',
  })
}

export function createTournament(data) {
  return request({
    url: '/tournament',
    method: 'post',
    data
  })
}

export function updateTournament(data) {
  return request({
    url: '/tournament',
    method: 'put',
    data
  })
}

export function deleteTournament(id) {
  return request({
    url: `/tournament?id=${id}`,
    method: 'delete'
  })
}
