import moment from 'moment'

// Get end of date time
export const getEoDTime = () => {
  return moment()
    .set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999
    })
    .unix()
}

// Get a week ago time
export const getWeekAgoTime = () => {
  return moment()
    .subtract(7, 'days')
    .set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999
    })
    .unix()
}
