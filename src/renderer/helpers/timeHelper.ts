export const roundUnixTimestampToMinutes = (minutes = 5) => (timeStamp?: number) => {
  return timeStamp ? timeStamp - (timeStamp % (minutes * 60)) : timeStamp
}
