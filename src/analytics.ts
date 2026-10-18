export type EventName='game_started'|'game_completed'|'mode_selected'|'session_duration'|'score'|'replay_clicked'|'daily_puzzle_completed'|'seasonal_objective_completed'|'share_button_clicked'|'returning_session';
export interface AnalyticsProvider{track(event:EventName,data:Record<string,unknown>):void}
let provider:AnalyticsProvider={track:()=>{}};
export function configureAnalytics(next:AnalyticsProvider){provider=next;}
export function track(event:EventName,data:Record<string,unknown>={}){try{provider.track(event,data);}catch{/* Analytics cannot interrupt a game. */}}
