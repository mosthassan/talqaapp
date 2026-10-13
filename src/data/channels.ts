import { LiveChannel } from '../types';
import { NETWORK_LINKS } from '../config/links';

/**
 * Initial Live HLS Channels
 * 
 * Strict Policy Notice:
 * In accordance with Phase 2 guidelines and Lovable roadmap instructions,
 * all 3 local channels are seeded with `enabled: false` pending formal verification
 * of licensed live streaming feeds by the network owner.
 * 
 * The UI gracefully handles 0 or 1+ enabled channels without fake scores or commentators.
 */
export const INITIAL_CHANNELS: LiveChannel[] = [
  {
    id: 'bein1',
    name: 'beIN Sports HD 1',
    streamUrl: NETWORK_LINKS.localServer.streams.bein1,
    category: 'كرة قدم عربية وعالمية',
    enabled: false, // Disabled until licensed streaming confirmation
    requiresLan: true,
    status: 'offline',
  },
  {
    id: 'bein2',
    name: 'beIN Sports HD 2',
    streamUrl: NETWORK_LINKS.localServer.streams.bein2,
    category: 'البطولات الأوروبية',
    enabled: false, // Disabled until licensed streaming confirmation
    requiresLan: true,
    status: 'offline',
  },
  {
    id: 'ssc1',
    name: 'SSC Sports 1 HD',
    streamUrl: NETWORK_LINKS.localServer.streams.ssc1,
    category: 'دوري المحترفين والآسيوية',
    enabled: false, // Disabled until licensed streaming confirmation
    requiresLan: true,
    status: 'offline',
  },
];
