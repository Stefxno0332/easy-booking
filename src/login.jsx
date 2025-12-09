import { GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth } from './firebase'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from './Authenticate'
import { Switch } from '@headlessui/react'
import Silk from "./Silk"


function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isResetting, setIsResetting] = useState(false)
    const [error, setError] = useState('')
    const { admin, setAdmin, isOnline, setEmailAdmin, emailAdmin } = useContext(AuthContext)
    const [step, setStep] = useState("login")

    useEffect(() => {
        //se sono in modalità admin la Email dell'host viene settata come la mia email
        if (admin) {
            setEmailAdmin(email)
        }
    }, [admin, email])

    const handleGoogleLogin = async () => {
        if (!isOnline) {
            setError("Accesso con Google disponibile solo online")
            return
        }

        if (!emailAdmin && !admin) {
            setError("Inserisci l'email host")
            return
        }




        console.log(emailAdmin)
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)

            const userEmail = result.user.email

            if (!emailAdmin && admin) {
                setEmailAdmin(userEmail)  // Imposta l'email dell'admin se sono in modalità admin
            }

        } catch (err) {
            setError(err.message)
        }



    }


    const handleEmailNewUser = async () => {
        if (!isOnline) {
            setError("Login disponibile solo online")
            return
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password)
        } catch (err) {
            setError(err.message)
        }
    }

    const handleEmailLogin = async () => {
        if (!isOnline) {
            setError("Accesso con email disponibile solo online")
            return
        }
        try {
            if (!emailAdmin) {
                setError("Inserisci l'email host")
                return
            }
            await signInWithEmailAndPassword(auth, email, password)
        } catch (err) {
            setError(err.message)
        }
    }

    const handleResetPassword = async () => {
        if (!email) return alert("Inserisci la tua email")
        try {
            await sendPasswordResetEmail(auth, email)
            alert("Email di reset inviata! Controlla la tua casella di posta.")
            setIsResetting(false) // Torna al login
        } catch (err) {
            setError(err.message)
        }
    }

    const handleCheckAdmin = async () => {
        try {
            const methods = await fetchSignInMethodsForEmail(auth, emailAdmin)
            console.log("metodi trovati: " + methods)
            if (methods.length === 0) {
                setError("Email host non valida")
            } else {
                setError("")
            }
        } catch (err) {
            setError(err.message)
        }
    }


    //insent mette tutti i lati a 0 quindi grandezza quanto alla viewport
    return (
        <>
            <div className="fixed w-screen h-screen inset-0 z-0">
                <Silk
                    speed={3}
                    scale={1}
                    color="#5227FF"
                    noiseIntensity={1.5}
                    rotation={0}
                />
            </div>


            <div className="fixed z-10 h-screen w-screen bg-transparent shadow-lg p-8 flex flex-col items-center justify-center">
                <div><p className="text-8xl font-extrabold text-white drop-shadow-lg text-[clamp(1rem,5vw,4rem)] whitespace-nowrap p-4"> Easy Booking</p></div>
                <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">

                    {step === "resetPassword" && (
                        <div className="flex flex-col gap-4 w-64">
                            <h2 className="text-gray-900 text-xl font-bold text-center">Recupera Password</h2>
                            <p className="text-gray-500 text-sm text-center">Inserisci la tua email per ricevere il link di reset.</p>
                            <input
                                type="text"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border border-gray-300 bg-white py-2 px-3 text-gray-900 "
                            />
                            <button
                                onClick={handleResetPassword}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 font-medium"
                            >
                                Invia Link
                            </button>
                            <button
                                onClick={() => setStep('login')}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                Torna al Login
                            </button>
                            {error && <p className="text-red-500">{error}</p>}
                        </div>
                    )}



                    {step !== "resetPassword" && (
                        <form className="flex flex-col gap-4 w-64">
                            <input
                                type="text"
                                name="email"
                                placeholder="Email utente"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border border-gray-300 bg-white py-2 px-3 text-gray-900 "
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border border-gray-300 bg-white py-2 px-3 text-gray-900"
                            />
                            {admin ? (
                                <p className="text-gray-500 text-sm text-center">Ti stai collegando al tuo calendario</p>
                            ) :
                                (
                                    <input
                                        type="text"
                                        name="emailAdmin"
                                        placeholder="Email host"
                                        value={emailAdmin}
                                        onChange={(e) => setEmailAdmin(e.target.value)} //quando digito modifico il vaolre di emailAdmin
                                        onBlur={handleCheckAdmin} //appeno finisco di digitare conrollo che l'email sia valida
                                        className="border border-gray-300 bg-white py-2 px-3 text-gray-900"
                                    />
                                )}

                            {step === "login" && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleEmailLogin}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg active:scale-95 transition-transform duration-150 font-medium"
                                    > Accedi con le tue credenziali </button>

                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="inline-flex items-center gap-3 rounded-full border border-[#DADCE0] bg-white px-6 py-3 text-sm font-medium text-[#3C4043] shadow-sm transition hover:bg-[#F6F9FE] focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2"
                                    >
                                        <span className="inline-flex h-5 w-5 items-center justify-center">
                                            <svg viewBox="0 0 48 48" className="h-5 w-5" role="img" aria-hidden="true">
                                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                                <path fill="none" d="M0 0h48v48H0z"></path>
                                            </svg>
                                        </span>
                                        <span className="text-sm font-medium"> Accedi con Google</span>
                                        <span className="sr-only">Accedi con Google</span>
                                    </button>
                                </>
                            )}
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium"> Modalità {admin ? 'Admin' : 'Utente'}</p>
                                <Switch
                                    checked={admin}
                                    onChange={setAdmin}
                                    className={`${admin ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-xl`}
                                >
                                    <span className={`${admin ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-xl bg-white transition`} />

                                </Switch>
                            </div>
                            {step === 'register' && (

                                <button
                                    type="button"
                                    onClick={handleEmailNewUser}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg active:scale-95 transition-transform duration-150 font-medium"
                                > Crea nuovo Account </button>
                            )}
                            {step === 'login' && (
                                <div className=" mt-1">
                                    <p onClick={() => setStep('register')} className="text-sm font-medium text-blue-500 hover:underline cursor-pointer text-center"> Register </p>
                                </div>
                            )}
                            {step === 'register' && (
                                <div className=" mt-1">
                                    <p onClick={() => setStep('login')} className="text-sm font-medium text-blue-500 hover:underline cursor-pointer text-center"> Login </p>
                                </div>
                            )}
                            {step === 'login' && (
                                <div className=" mt-1">
                                    <p onClick={() => setStep('resetPassword')} className="text-sm font-medium text-blue-500 hover:underline cursor-pointer text-center"> Reset Password </p>
                                </div>
                            )}
                            {error && <p className="text-red-500">{error}</p>}
                            {isOnline ? <p className="text-green-500">Online</p> : <p className="text-red-500">Offline</p>}
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}

export default Login





