export interface Event {
  type: "click";
  data: EventData;
}

export interface EventData {
  name: string;
}
