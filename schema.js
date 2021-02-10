const buildsDoc = {
  _id: '',
  source: 'blitzgg',
  champID: 123, //Riot ID for champion
  role: '', //TOP, JUNGLE, MID, ADC, SUPPORT
  buildID: 'blitzgg-123-top', //{source}-{champID}-role (used for updating build records)
  byWinRate: {
    start: [1, 2, 3],
    full: [4, 5, 6, 7, 8, 9]
  },
  byPickRate: {
    start: [1, 2, 3],
    full: [4, 5, 6, 7, 8, 9]
  },
  lastUpdated: 123456789,
}

const champsDoc = {
  _id: '',
  champID: 123, //Riot ID for champion
  internalName: '', //Riot "internal name" for champion (i.e. "MonkeyKing" for Wukong)
  champName: '', //Common name
}