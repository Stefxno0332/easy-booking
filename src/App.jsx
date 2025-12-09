import { useEffect, useState, useContext, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { signOut } from 'firebase/auth'
import { auth, db, getToken, messaging } from './firebase'
import { collection, query, where, addDoc, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore'
import './App.css'
import Login from './login'
import { AuthContext } from './Authenticate'
import { onMessage } from 'firebase/messaging'



function App() {
  const { user, admin, isOnline, emailAdmin } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [infoPanel, setInfoPanel] = useState(false);
  const [info, setInfo] = useState({});
  const [eventPanel, setEventPanel] = useState(false);
  const [fromCache, setFromCache] = useState(false)
  const [pendingData, setPendingData] = useState(false)

  const title = useRef(null);
  const color = useRef(null);

  useEffect(() => {

    if (user) {  // Controlla se l'utente esiste
      console.log("Cercando prenotazioni per email:", user.email)

      //recupera tutte le prenotazioni di quell'host
      const q = query(
        collection(db, "prenotazioni"),
        where("emailAdmin", "==", emailAdmin)
      )

      //uso query snapshot per Aggiornamenti automatici dell'UI
      //Funzionalità offline
      //Sincronizzazione tra dispositivi
      //ritorna una funzione di unsubscribe
      //includeMetadata permette di richiamare onspanshot anche quando variano i metadati come ad esempio haspendingwrites.
      const querySnapshot = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const eventsTemp = []
        console.log("Numero documenti trovati:", querySnapshot.size)

        querySnapshot.forEach((doc) => {
          if (!admin) {
            const newEvent = doc.data()
            console.log("Confronto email:", newEvent.email, "vs", user.email)
            if (newEvent.email === user.email) {
              eventsTemp.push({ id: doc.id, ...newEvent })
            } else {
              newEvent.title = "prenotato"
              newEvent.backgroundColor = "red"
              eventsTemp.push({ id: doc.id, ...newEvent })
            }
          } else {
            eventsTemp.push({ id: doc.id, ...doc.data() })
          }
        })
        console.log("Prenotazioni recuperate:", eventsTemp)
        console.log("Dati presi dalla cache:", querySnapshot.metadata.fromCache)
        //ci sono dati che ancora dalla cache non sono stati scritti nel server?
        console.log("hasPendingWrites:", querySnapshot.metadata.hasPendingWrites);
        setEvents(eventsTemp)
        setFromCache(querySnapshot.metadata.fromCache)
        setPendingData(querySnapshot.metadata.hasPendingWrites)
      })

      //rimuovo il listener quando il componente viene distrutto
      //come se fosse un abbonamento a firestore, mi ci discrivo quando non serve più
      return () => {
        querySnapshot()
      }
    }
  }, [user]) // dipendenze [] , rieseguito quando user cambia

  //quando l'utente viene creato (dopo il login)  faccio il setup delle notifiche e salvo il token su firestore
  useEffect(() => {
    let unsubscribe = null;
    async function setupNotifiche() {

      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          console.log('Permission granted')
        } else {
          console.log('Permission denied')
          return
        }

        // importato all'inizio del file
        if (!messaging) {
          console.log('messaging non inizializzato')
          return
        }

        if (user) {

          //registro custom service worker e uso direttamente il registration ritornato
          //non uso navigator.serviceWorker.ready perché prende l'altro sw e si bugga
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

          //collegamente e subscription automatica da firebase, ritorna il token
          const token = await getToken(messaging, { serviceWorkerRegistration: registration, vapidKey: "BM7nuFMryHNtgW4Fo37VmcVa58-FS2DkHQly_FFODtf744covpRAehzX_3SknBavnCrhTXdeJknUNbGat3jCg8c" })

          console.log("token", token)
          console.log("user email", user.email)
          // tocken salvato su firestore per inviare notifiche al dispositivo dopo che si è registrato
          //ci possono essere più token per un utente se accede con più dispositivi
          await setDoc(doc(db, 'users', user.email, 'tokens', token), { token: token });

          //listener per ricevere le notifiche
          unsubscribe = onMessage(messaging, (payload) => {
            console.log("notifica ricevuta", payload)
            new Notification(payload.notification.title, {
              body: payload.notification.body,
            });
          });


        }
      } catch (error) {
        console.log('Error durante il setup delle notifiche', error)
        return
      }
    }

    setupNotifiche()
    return () => { if (unsubscribe) unsubscribe(); } //cleanup quando il componente si smonta (cioè cambio pagina o c'è un cambio di stato)(si elimina il listener delle notifiche)
  }, [user])

  function handleDateSelect(info) {
    console.log(info)
    //visualizza prezzo e inserisci prenotazione
    setInfo(info)
    setInfoPanel(true)
    setEventPanel(false)

  }

  function handleMultiDateSelect(info) {

    console.log(info)
    //visualizza prezzo e inserisci prenotazione
    setInfo(info)
    setInfoPanel(true)
    setEventPanel(false)

  }

  function handleEventClick(info) {
    console.log(info.event)
    setInfo(info)
    setEventPanel(true)
    setInfoPanel(false)
  }


  async function setPrenotazione(email, backgroundColor, end, start, title) {
    // Se è una prenotazione per un solo giorno, imposto end alla fine del giorno
    if (end.getTime() === start.getTime()) {
      end = new Date(end);
      end.setHours(23, 59, 59, 999);
    }
    await addDoc(collection(db, "prenotazioni"), {
      backgroundColor: backgroundColor,
      email: email,
      emailAdmin: emailAdmin,
      end: end.toISOString(),
      start: start.toISOString(),
      title: title
    })
    // Ricarica le prenotazioni per aggiornare il calendario fatto i automatico da snapshot
    //await fetchPrenotazioni(email)
    // Chiudi il pannello info
    setInfoPanel(false)
  }

  async function deletePrenotazione(id) {
    await deleteDoc(doc(db, "prenotazioni", id))
    // Ricarica le prenotazioni per aggiornare il calendario fatto i automatico da snapshot
    //await fetchPrenotazioni(user.email)
    // Chiudi il pannello info
    setEventPanel(false)
  }

  // Se l'utente non ha fatto l'accesso parte la schermata di login
  if (!user) {
    return <Login />
  }


  // Variabile per il calendario
  const calendario = (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView='dayGridMonth'
      locale='it'
      height="100%"
      themeSystem="standard"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      }}
      editable={true}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      weekends={true}
      events={events}
      dateClick={(info) => handleDateSelect(info)}
      select={(info) => handleMultiDateSelect(info)}
      eventClick={(info) => handleEventClick(info)}
    />
  )


  //una colonna per mobile e due da laptop (lg) in su 
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr] lg:grid-rows-[1fr_5fr_1fr] min-h-screen lg:h-screen overflow-auto lg:overflow-hidden">

      <aside className="order-2 lg:col-start-1 lg:row-start-1 lg:row-span-3 lg:pr-3 flex flex-col">

        <div className="hidden lg:flex items-center justify-center bg-gray-900 p-6 ">
          <p className="text-white text-7xl text-[clamp(1rem,5vw,4rem)] whitespace-nowrap p-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] font-bold"> Easy Booking</p>
        </div>

        <div className="bg-gray-900 w-full flex-1 p-4 flex flex-col min-h-0">
          <div className="p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
            {infoPanel && info && !eventPanel && (
              <div className='flex flex-col gap-2 bg-white p-4 rounded-lg'>
                <p className='text-lg font-bold'>Nuova prenotazione</p>
                {info.start && info.end && (
                  <>
                    <p className='text-md'>Inizio: {info.start?.toLocaleString()}</p>
                    <p className='text-md'>Fine: {info.end?.toLocaleString()}</p>
                  </>
                )}
                {info.date && (
                  <p className='text-md'>Tutto il giorno: {info.date?.toLocaleDateString()}</p>
                )}
                <p className='text-md'>Tipo prenotazione : <input type="text" placeholder="Titolo" ref={title} className="border border-gray-300 rounded px-2 py-1" /></p>
                <p className='text-md'>Colore : <input type="color" ref={color} className="border border-gray-300 rounded-lg" /></p>
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium transition-transform duration-150 active:scale-95" onClick={() => setPrenotazione(user.email, color.current.value, info.end || info.date, info.start || info.date, title.current.value)}>Prenota Ora</button>
              </div>
            )}

            {eventPanel && info && !infoPanel && (
              <div className='flex flex-col gap-2 bg-white p-4 rounded-lg'>
                <p className='text-lg font-bold'>Evento selezionato</p>
                <p className='text-md'>Inizio: {info.event.start?.toLocaleString()}</p>
                <p className='text-md'>Fine: {info.event.end?.toLocaleString()}</p>
                <p className='text-md'>Tipo prenotazione : {info.event.title || "Prenotazione"}</p>
                {admin && <p className="text-md">Prenotato da: {events.find(event => event.id === info.event.id).email}</p>}
                {admin && (
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium transition-transform duration-150 active:scale-95" onClick={() => deletePrenotazione(info.event.id)}>Elimina</button>
                )}
              </div>
            )}

            <div className='flex bg-white flex-col p-4 rounded-lg  flex-1 min-h-0 mb-4  '>
              <p className='text-lg font-bold mb-2'>Le tue prenotazioni:</p>
              <div className='overflow-y-auto '>
                {events.map((event, index) => (event.email === user.email &&
                  <p key={event.id} className='py-1 text-md capitalize '>{index + 1}. {event.title}</p>
                ))}
              </div>
            </div>

          </div>
        </div>
      </aside>

      <header className="order-4 flex flex-col items-end p-1 gap-0.5">
        {isOnline ? <p className="text-green-500">Online</p> : <p className="text-red-500">Offline</p>}
        {fromCache ? <p className="text-yellow-500">Dati presi dalla cache</p> : <p className="text-green-500">Dati presi dal server</p>}
        {pendingData ? <p className="text-yellow-500">Aggiornamenti non ancora sincronizzati</p> : <p className="text-green-500">Aggiornamenti sincronizzati</p>}
        {emailAdmin ? <p className="text-green-500">Connesso al calendario di {emailAdmin}</p> : <p className="text-red-500">Non connesso al calendario dell'host riesegui il login</p>}
      </header>

      <main className="order-1 lg:col-start-2 lg:row-start-2 z-50 shadow-2xl min-h-[500px] lg:h-full overflow-auto">
        {calendario}
      </main>


      <div className="order-3 lg:col-start-2 lg:row-start-3 flex p-5 justify-end">
        <div className='bg-gray-900 flex items-center gap-4 p-4 rounded-xl'>
          <p className="text-white font-bold">{user?.email || 'Ospite'}</p>

          <button
            onClick={() => signOut(auth)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-transform duration-150 active:scale-95">
            Logout
          </button>

          <div className="hidden lg:block">
            {admin ? <p className="text-white font-bold">Admin</p> : <p className="text-white font-bold">Ospite</p>}
          </div>

        </div>
      </div>

    </div>
  )
}

export default App




