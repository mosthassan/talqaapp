import { LiveChannel } from '../types';
import { NETWORK_LINKS } from '../config/links';

/**
 * Initial Live HLS Channels
 * 
 * Local network service provided free of charge on MikroTik without requiring a card or active internet.
 * Streams are hosted on the local server at 192.168.50.2:8888.
 */
export const INITIAL_CHANNELS: LiveChannel[] = [
  {
    id: 'bein1',
    name: 'beIN Sports HD 1',
    streamUrl: NETWORK_LINKS.localServer.streams.bein1,
    category: 'كرة قدم عربية وعالمية',
    enabled: true, // Enabled for local LAN Wi-Fi network streaming
    requiresLan: true,
    status: 'live',
  },
  {
    id: 'bein2',
    name: 'beIN Sports HD 2',
    streamUrl: NETWORK_LINKS.localServer.streams.bein2,
    category: 'البطولات الأوروبية',
    enabled: true, // Enabled for local LAN Wi-Fi network streaming
    requiresLan: true,
    status: 'live',
  },
  {
    id: 'ssc1',
    name: 'SSC Sports 1 HD',
    streamUrl: NETWORK_LINKS.localServer.streams.ssc1,
    category: 'دوري المحترفين والآسيوية',
    enabled: true, // Enabled for local LAN Wi-Fi network streaming
    requiresLan: true,
    status: 'live',
  },
];
