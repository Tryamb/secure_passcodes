import './Login.css'
import axios from 'axios'
import { useState } from 'react'

const Login=()=>{
  const [error,setError]= useState('')
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const submitHandler=async(e)=>{

    e.preventDefault();

    const config = {
      headers: {
        'content-type': 'application/json',
      },
    };
    const credentials={
      username:username,
      password:password
    }
    try {
      const {data} = await axios.post(
        'http://localhost:5000/init',
        credentials,
        config
      )

      if(data.isAuth){
        const {token,cryptoSalt}=data
        let salt=saltStringToUint8Array(cryptoSalt)
        await setClientSideData(password,salt,token)
        window.location.href="/"
      }else{
        setError(data.message);
        setTimeout(() => {
          setError('');
        }, 5000);
      }
      
    } catch (error) {
      setError(error.toString());
      setTimeout(() => {
        setError('');
      }, 5000);
    }

    setUsername('')
    setPassword('')
  }
  async function generateKey(password,salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    
    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    return key;
}

const setClientSideData=async (password,cryptoSalt,token)=>{
    const key=await generateKey(password,cryptoSalt);

    //store key in local storage
    window.crypto.subtle.exportKey("jwk",key).then(
      e=>localStorage.setItem("webkey",JSON.stringify(e))
    );
    localStorage.setItem('authToken', token)
  }

  function saltStringToUint8Array(saltString) {
    const uint8array = new Uint8Array(saltString.length);
    for (let i = 0; i < saltString.length; i++) {
        uint8array[i] = saltString.charCodeAt(i);
    }
    return uint8array;
  }

  return(
    <div className="login-screen">
      <form onSubmit={submitHandler} className="login-screen__form">
        <h3 className="login-screen__title">Login to Continue</h3>
        {error && <span className="error-message">{error}</span>}

        <div className="form-group">
          <label htmlFor="Username">Username:</label>
          <input
            type="text"
            name="Username"
            id="Username"
            placeholder="eg=> Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            tabIndex={1}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pass">
            Password:{' '}
          </label>
          <input
            tabIndex={2}
            type="password"
            name="pass"
            id="pass"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" tabIndex={3}>
          Submit
        </button>
      </form>
    </div>
  );
}
export default Login;