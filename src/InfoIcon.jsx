import { Wifi, WifiOff, Database, Cloud, RefreshCw, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import SpotlightCard from './SpotlightCard';


/// contiene il codice jsx dell'header che mostra le informazioni sulla connessione , cache , sincronizzazione dati da cache a servere e se si è connessi all'host
export default function InfoIcon({ isOnline, fromCache, pendingData, emailAdmin }) { //props
    return (
        <>
            <div className="flex flex-row justify-end gap-2">
                <SpotlightCard className="flex flex-row flex-wrap justify-end items-center gap-3 bg-gray-900! p-3! rounded-xl!" spotlightColor="rgba(0, 229, 255, 0.2)">


                    <div className="flex items-center gap-1.5">
                        {isOnline ? (
                            <>
                                <Wifi className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-sm font-medium">Online</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Offline</span>
                            </>
                        )}
                    </div>
                    <div className="w-px h-4 bg-gray-600" /> {/* linea di separazione larga 1 e alta 4 di colore grigio  */}

                    <div className="flex items-center gap-1.5">
                        {fromCache ? (
                            <>
                                <Database className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 text-sm font-medium">Cache</span>
                            </>
                        ) : (
                            <>
                                <Cloud className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-sm font-medium">Server</span>
                            </>
                        )}
                    </div>
                    <div className="w-px h-4 bg-gray-600" />

                    <div className="flex items-center gap-1.5">
                        {pendingData ? (
                            <>
                                <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                                <span className="text-yellow-400 text-sm font-medium">Sync...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-sm font-medium">Sincronizzato</span>
                            </>
                        )}
                    </div>
                    <div className="w-px h-4 bg-gray-600" />

                    <div className="flex items-center gap-1.5">
                        {emailAdmin ? (
                            <>
                                <Calendar className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-sm font-medium">{emailAdmin}</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-sm font-medium">Non connesso all'host riaccedi</span>
                            </>
                        )}
                    </div>
                </SpotlightCard>
            </div>
        </>
    )
}
