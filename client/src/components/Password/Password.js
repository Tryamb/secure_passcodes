import './Password.css'
import './AddPassword.css'
import { useState, useEffect } from 'react'
import axios from 'axios'

const Password = () => {
  const [arr,setArr]=useState([]);
  const [error,setError]=useState('');

  async function decryptData(key, encryptedData, iv) {
    const dec = new TextDecoder();
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encryptedData
    );
    
    return dec.decode(decrypted);
}

async function getKeyFromLocalStorage() {
  const jwkString = localStorage.getItem('webkey');
  if (!jwkString) {
      throw new Error('No key found in localStorage');
  }
  
  const jwk = JSON.parse(jwkString);
  return window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
  );
}

  const getData=async()=>{
    const config = {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    };

    try {
      const {data} = await axios.get(
        'http://localhost:5000/api/show',
        config
      )
      
      if(data){
        setArr(data);
        console.log(data);
      }
      
    } catch (error) {
      const {name,message}=error.response.data.error
      console.log(name)
      if(name==="JsonWebTokenError"){
        localStorage.removeItem('authToken');
        localStorage.removeItem('webkey');
      }
      setError(error.toString()+message);
      setTimeout(() => {
        setError('');
      }, 5000);
      // localStorage.removeItem('authToken');
      //   localStorage.removeItem('webkey');
        console.log(localStorage.getItem('authToken'));
    }
  }

  useEffect(async()=>{
    getData();
  },[])
 

  async function copy (eachObject){   
     
     let decryptedPass=await decryptData(await getKeyFromLocalStorage(),
              new Uint8Array(eachObject.password.toString().split(',')),
              new Uint8Array(eachObject.IV.toString().split(',')))
     writeClipboardText(decryptedPass)
  }

  async function writeClipboardText(copiedText){
     try {
       await navigator.clipboard.writeText(copiedText)
       alert("Password copied to clipboard")
     } catch (error) {
       console.error(error.message)
     }
  }

  return (
    <div className='about center'>
            {error && <span className="error-message">{error}</span>}
    <table>
      <thead>
          <th>Account</th>
          <th>Username</th>
          <th>Password</th>
        
      </thead>
    <tbody>
    {
      arr.map((eachObject)=>(
        <tr>
          <td>{eachObject.accountName}</td>

          <td>{eachObject.username}</td>
         
          <td id="pass">
          <div>
            <img src='./images/copyIcon.png' onMouseDown={e=>copy(eachObject)}></img>
            <p>{eachObject.password}</p>
            {/* <p>{decrypt({ iv: eachObject.IV, encryptedData: eachObject.password})}</p> */}
          </div>
          </td>
          
        </tr> 
      ))
    }
    </tbody>
   

    </table>

    </div>
  )
}

export default Password
