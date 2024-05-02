import './login.css'
import imge from '../assets/311532.png'
import { useRef, useState } from 'react'
import axios from 'axios'
import { Cancel } from '@material-ui/icons'


export default function Login({ setShowLogin, myStorage, setCurrentUser }) {
    const [fail, setFail] = useState(false)

    const nameRef = useRef()
    const passwordRef = useRef()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = {
            username: nameRef.current.value,
            password: passwordRef.current.value
        };

        try {
            const res = await axios.post("/users/login", user);
            myStorage.setItem('user', res.data.username);
            setCurrentUser(res.data.username);
            setShowLogin(false);
        } catch (err) {
            setFail(true);
        }
    };

    return (
        <div className='loginCont'>
            <div className='formContL'>
                <img src={imge} alt="Mole Hole" className="logo" />
                <span>Mole Hole</span>

                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder='Usuario' ref={nameRef} />
                    <input type="password" placeholder='Senha' ref={passwordRef} />
                    <button className='btnLogin'>Entrar</button>

                </form>
            </div>
            {fail && (
                <span className='fail'> Usuario ou senha invalidos!</span>
            )}
            <Cancel className='closeBtn' onClick={() => setShowLogin(false)} />
        </div>
    )
}