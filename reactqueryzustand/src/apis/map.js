import api from '../lib/api'

export const getRouteNearby = async (step, coordinatesString) => {
  const response = await api({ method: "GET", cmd: `lbse/route?lnglat=${coordinatesString}` })
  return response
}