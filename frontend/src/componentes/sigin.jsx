import './sigin.css'
import imge from '../assets/311532.png'
import { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { Cancel } from '@material-ui/icons'


export default function Sigin({ setShowSigin }) {
    const [success, setSuccess] = useState(false)
    const [fail, setFail] = useState(false)

    const nameRef = useRef()
    const emailRef = useRef()
    const passwordRef = useRef()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newUser = {
            username: nameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value
        };

        try {
            await axios.post("/users/register", newUser);
            setFail(false);
            setSuccess(true);
        } catch (err) {
            setFail(true)
        }
    };

    useEffect(() => {
        let successTimer, failTimer;

        if (success) {
            setFail(false)
            successTimer = setTimeout(() => {
                setSuccess(false);
                setShowSigin(false)
            }, 3000);
        }

        if (fail) {
            setSuccess(false)
            failTimer = setTimeout(() => {
                setFail(false);
            }, 3000);
        }

        return () => {
            clearTimeout(successTimer);
            clearTimeout(failTimer);
        };
    }, [success, fail]);

    return (
        <div className='siginCont'>
            <div className='formCont'>

                <img src={imge} alt="Mole Hole" className="logo" />
                <span>Mole Hole</span>

                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder='Usuario' ref={nameRef} />
                    <input type="email" placeholder='Email' ref={emailRef} />
                    <input type="password" placeholder='Senha' ref={passwordRef} />
                    <button className='btnSigin'>Registrar</button>
                </form>
            </div>
                {success && (
                    <span className='success'> Conta Criada com sucesso!</span>
                )}

                {fail && (
                    <span className='fail'> Esse nome de usuario ja existe!</span>
                )}
                <Cancel className='closeBtn' onClick={() => setShowSigin(false)} />

        </div>
    )
}