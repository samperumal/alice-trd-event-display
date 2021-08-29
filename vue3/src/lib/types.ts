export type DisplayData = {
  loading: false,
  treeData: EventTreeData,
  rawData: EventData
}

export type EventTreeData = Array<{
  id: string,
  label: string,
  tracks: Array<{
    label: string
  }>
}>

export type EventData = Array<Event>

export type Event = {
  id: string,
  i: {
    be: string,
    bt: string,
    ft: string
  },
  tracks: Array<Track>,
  trklts: Array<Tracklet>
}

export type Track = {
  id: string,
  stk: number,
  sec: number,
  typ: string,
  i: {
    pT: number,
    alpha: number,
    lambda: number,
    pid: number
  },
  path: Array<Coord3D>,
  tlids: Array<string>
}

export type Tracklet = {
  id: string,
  stk: number,
  sec: number,
  lyr: number,
  row: number,
  trk: string,
  lY: number,
  dyDx: number,
  dyDxAN: number,
}

export type Coord3D = {
  x: number,
  y: number,
  z: number
}