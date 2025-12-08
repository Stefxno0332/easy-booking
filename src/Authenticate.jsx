import { useState, useEffect, createContext } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Serve per condividere i vari stati con tutta l'app. 

// Creo il contesto dell'autenticazione dell'utente da passare poi ai figli( app.jsx )
const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(false); // Stato admin condiviso
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [emailAdmin, setEmailAdmin] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {

            setUser(user);
        });
        //onAuthStateChanged restituisce una funzione di unsubscribe
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            console.log("ONLINE");
            setIsOnline(true);
        };
        const handleOffline = () => {
            console.log("OFFLINE");
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline); //pagina online
        window.addEventListener('offline', handleOffline); //pagina offline

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, admin, setAdmin, isOnline, emailAdmin, setEmailAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

// Authprovider mi serve nel Main per condividere lo stato
// AuthContext mi serve nel App per caricare il contesto
export { AuthContext, AuthProvider }
