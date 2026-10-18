export type AdPlacement='home'|'results'|'desktop-sidebar'|'game-over'|'rewarded';
export interface AdService{enabled:boolean;display(placement:AdPlacement,element:HTMLElement):Promise<void>;interstitial(placement:'game-over'):Promise<'shown'|'unavailable'>;rewarded():Promise<'completed'|'unavailable'>}
export const disabledAdService:AdService={enabled:false,display:async()=>{},interstitial:async()=>'unavailable',rewarded:async()=>'unavailable'};
export let adService=disabledAdService;
export function configureAds(service:AdService){adService=service;}
// Real providers must be consent/approval configured. Never grant rewards on unavailable or skipped ads.
export function AdSlot({placement}:{placement:AdPlacement}){if(!adService.enabled)return null;return <aside aria-label="Advertisement" className="ad-slot" ref={el=>{if(el)void adService.display(placement,el);}}/>;}
